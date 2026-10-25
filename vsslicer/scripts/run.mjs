#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: node scripts/run.mjs <command> [--changed <git-ref>]
// Commands: install | publish | ci | any pnpm script name (run where the module defines it).
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { changed, localDeps, order } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registry = 'http://localhost:4873/';
// Verdaccio accepts any token for @vsslicer/* publishes; pnpm just needs one to be set. Never written to disk.
const publishEnv = { ...process.env, 'npm_config_//localhost:4873/:_authToken': 'local-dev' };

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

const sh = (m, argv, env = process.env) => {
  console.log(`\n[${m.name}] pnpm ${argv.join(' ')}`);
  const r = spawnSync('pnpm', argv, { cwd: join(root, 'modules', m.dir), stdio: 'inherit', env });
  if (r.status !== 0) (console.error(`${m.name}: pnpm ${argv.join(' ')} failed`), process.exit(r.status ?? 1));
};

const published = async (m) => {
  const res = await fetch(`${registry}${m.name.replace('/', '%2f')}`);
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
    for (const s of ['lint', 'build', 'test']) if (s in m.scripts) sh(m, ['run', s]);
    await publish(m);
  } else if (cmd === 'publish') await publish(m);
  else if (cmd === 'install') sh(m, steps.install);
  else if (cmd in m.scripts) sh(m, ['run', cmd]);
}
