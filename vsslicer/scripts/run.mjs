#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: node scripts/run.mjs <command> [--changed <git-ref>] [--list]   (--list prints the selected module names as JSON and exits)
// Commands: install | publish | checks | ci | any pnpm script name (run where the module defines it).
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { changed, localDeps, order, withDeps } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registry = 'http://localhost:4873/';
// Verdaccio accepts any token for @vsslicer/* publishes; pnpm just needs one to be set. Never written to disk.
// pnpm aborts without a TTY (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY) unless CI is set
const env = { ...process.env, CI: 'true' };
const publishEnv = { ...env, 'npm_config_//localhost:4873/:_authToken': 'local-dev' };

const args = process.argv.slice(2);
const cmd = args[0];
const ref = args.includes('--changed') ? args[args.indexOf('--changed') + 1] : undefined;
if (!cmd || cmd.startsWith('--') || (args.includes('--changed') && !ref)) {
  console.error('usage: node scripts/run.mjs <command> [--changed <git-ref>]');
  process.exit(2);
}

const modules = readdirSync(join(root, 'modules'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => {
    const pkg = JSON.parse(readFileSync(join(root, 'modules', e.name, 'package.json'), 'utf8'));
    return { dir: e.name, name: pkg.name, version: pkg.version, scripts: pkg.scripts ?? {}, deps: localDeps(pkg) };
  });

let names;
try {
  names = order(modules);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
if (ref) {
  const git = (a) => {
    const r = spawnSync('git', a, { cwd: root, encoding: 'utf8' });
    if (r.status !== 0) (console.error(r.stderr), process.exit(1));
    return r.stdout.split('\n').filter(Boolean);
  };
  // committed/staged/unstaged changes since ref, plus untracked files
  const files = [...git(['diff', '--name-only', '--relative', ref, '--', '.']), ...git(['ls-files', '--others', '--exclude-standard'])];
  const hit = changed(modules, files);
  names = names.filter((n) => hit.has(n));
}
// `--list`: print the selection as JSON and stop (the CI select job reads it)
if (args.includes('--list')) (console.log(JSON.stringify(names)), process.exit(0));
// ci on a subset: unselected dependencies are still installed, built and published (a clean registry has none), but not linted or tested
const selected = new Set(names);
if (cmd === 'ci') names = order(modules).filter((n) => withDeps(modules, selected).has(n));

const sh = (m, argv, e = env) => {
  console.log(`\n[${m.name}] pnpm ${argv.join(' ')}`);
  const r = spawnSync('pnpm', argv, { cwd: join(root, 'modules', m.dir), stdio: 'inherit', env: e, shell: process.platform === 'win32' });
  if (r.status !== 0) (console.error(`${m.name}: pnpm ${argv.join(' ')} failed`), process.exit(r.status ?? 1));
};

const published = async (m) => {
  // node's fetch occasionally hits a keep-alive socket Verdaccio just closed: retry
  let res;
  for (let i = 0; ; i++)
    try {
      res = await fetch(`${registry}${m.name.replace('/', '%2f')}`);
      break;
    } catch (e) {
      if (i >= 2) throw e;
    }
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`${m.name}: registry answered ${res.status}`);
  return m.version in ((await res.json()).versions ?? {});
};

const publish = async (m) => {
  if (await published(m)) return console.log(`\n[${m.name}] ${m.version} already published, skipping`);
  sh(m, ['publish', '--no-git-checks'], publishEnv);
};

const steps = { install: ['install', '--frozen-lockfile'] };
for (const name of names) {
  const m = modules.find((x) => x.name === name);
  if (cmd === 'ci') {
    sh(m, steps.install);
    for (const s of selected.has(name) ? ['lint', 'build', 'test'] : ['build']) if (s in m.scripts) sh(m, ['run', s]);
    await publish(m);
  } else if (cmd === 'publish') await publish(m);
  else if (cmd === 'install') sh(m, steps.install);
  else if (cmd in m.scripts) sh(m, ['run', cmd]);
}

// Negative checks over all modules: phantom dependencies fail the build, pnpm settings stay strict.
if (cmd === 'ci' || cmd === 'checks') {
  console.log('\n[checks] node --test phantom-dep + npmrc');
  const r = spawnSync(process.execPath, ['--test', 'test/phantom-dep.test.mjs', 'test/npmrc.test.mjs'], { cwd: join(root, 'scripts'), stdio: 'inherit', env });
  if (r.status !== 0) (console.error('checks failed'), process.exit(r.status ?? 1));
  // licence fields, SPDX headers, ported-file provenance: tooling's bin from source, so it needs no install
  console.log('\n[checks] check-licence');
  const dirs = [...modules.map((m) => join(root, 'modules', m.dir)), join(root, 'fixtures', 'phantom-dep')];
  const l = spawnSync(process.execPath, [join(root, 'modules', 'tooling', 'bin', 'check-licence.mjs'), ...dirs], { stdio: 'inherit', env });
  if (l.status !== 0) (console.error('checks failed'), process.exit(l.status ?? 1));
  console.log('\n[checks] check-fixtures');
  const f = spawnSync(process.execPath, [join(root, 'scripts', 'check-fixtures.mjs'), root], { stdio: 'inherit', env });
  if (f.status !== 0) (console.error('checks failed'), process.exit(f.status ?? 1));
}
