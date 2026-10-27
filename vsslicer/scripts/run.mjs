#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: node scripts/run.mjs <command> [--changed <git-ref>] [--list]   (--list prints the selected module names as JSON and exits)
// Commands: install | publish | checks | ci [--allow-unbumped] | version-check --base <ref> | release --dry-run <dir> | any pnpm script name (run where the module defines it).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { moduleDirs } from './modules.mjs';
import { changed, fetchRetry, isUnreleased, unreleasedDepProblems, localDeps, order, withDeps } from './lib.mjs';
import { changelogSection, integrityProblems, stalePinProblems, lockfileIntegrities, prepackProblems, registryProblems, releaseTag, versionProblems } from './versioning.mjs';

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

const modules = moduleDirs(join(root, 'modules')).map((dir) => {
  const pkg = JSON.parse(readFileSync(join(root, 'modules', dir, 'package.json'), 'utf8'));
  return { dir, name: pkg.name, version: pkg.version, pkg, scripts: pkg.scripts ?? {}, deps: localDeps(pkg), devDeps: localDeps({ devDependencies: pkg.devDependencies }).filter((n) => !localDeps({ ...pkg, devDependencies: {} }).includes(n)) };
});

const modFile = (m, f) => (existsSync(join(root, 'modules', m.dir, f)) ? readFileSync(join(root, 'modules', m.dir, f), 'utf8') : undefined);

if (cmd === 'version-check') {
  // each module whose published files changed since --base needs a new version and a CHANGELOG.md entry
  const base = args[args.indexOf('--base') + 1];
  if (!args.includes('--base') || !base) (console.error('usage: node scripts/run.mjs version-check --base <git-ref>'), process.exit(2));
  const git = (a) => {
    const r = spawnSync('git', a, { cwd: root, encoding: 'utf8' });
    return r.status === 0 ? r.stdout : undefined;
  };
  const files = git(['diff', '--name-only', '--relative', base, '--', '.'])?.split('\n').filter(Boolean);
  if (!files) (console.error(`version-check: cannot diff against ${base}`), process.exit(1));
  files.push(...git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean));
  const problems = modules.flatMap((m) => {
    const prefix = `modules/${m.dir}/`;
    // a module absent at base (or base is the empty tree) is new
    const old = git(['show', `${base}:./${prefix}package.json`]);
    return versionProblems({
      dir: m.dir,
      changed: files.filter((f) => f.startsWith(prefix)).map((f) => f.slice(prefix.length)),
      files: m.pkg.files ?? [],
      baseVersion: old === undefined ? null : JSON.parse(old).version,
      version: m.version,
      changelog: modFile(m, 'CHANGELOG.md'),
    });
  });
  problems.forEach((p) => console.error(`version-check: ${p}`));
  console.log(problems.length ? '' : 'version-check: ok');
  process.exit(problems.length ? 1 : 0);
}

if (cmd === 'release') {
  // prints the CHANGELOG section and the tag; creating the tag is left to the release process
  const m = modules.find((x) => x.dir === args[2] || x.name === `@vsslicer/${args[2]}`);
  if (!args.includes('--dry-run') || !m) (console.error('usage: node scripts/run.mjs release --dry-run <module-folder or name>'), process.exit(2));
  const section = changelogSection(modFile(m, 'CHANGELOG.md') ?? '', m.version);
  if (section === null) (console.error(`release: ${m.dir} CHANGELOG.md has no "## ${m.version}" entry`), process.exit(1));
  console.log(`${section}\n\ntag: ${releaseTag(m.name.replace('@vsslicer/', ''), m.version)}`);
  process.exit(0);
}

// ci publishes only versions the registry lacks, so an unbumped edit would be tested against the old published code: stop first.
// --allow-unbumped is for deliberate local iteration; CI never passes it.
if (cmd === 'ci' && !args.includes('--allow-unbumped')) {
  const v = spawnSync(process.execPath, [fileURLToPath(import.meta.url), 'version-check', '--base', 'HEAD'], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
  if (v.status !== 0) {
    console.error('ci: stopped before install/publish. Bump the module version in package.json and add a "## <version>" entry to its CHANGELOG.md (or pass --allow-unbumped to iterate locally on purpose).');
    process.exit(1);
  }
}

let names, fullOrder;
try {
  names = fullOrder = order(modules);
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
if (cmd === 'ci') names = fullOrder.filter((n) => withDeps(modules, selected).has(n));

if (cmd === 'ci') {
  const bad = unreleasedDepProblems(modules.filter((m) => names.includes(m.name)));
  if (bad.length) (bad.forEach((p) => console.error(`ci: ${p}`)), process.exit(1));
}

const sh = (m, argv, e = env) => {
  console.log(`\n[${m.name}] pnpm ${argv.join(' ')}`);
  const r = spawnSync('pnpm', argv, { cwd: join(root, 'modules', m.dir), stdio: 'inherit', env: e, shell: process.platform === 'win32' });
  if (r.status !== 0) (console.error(`${m.name}: pnpm ${argv.join(' ')} failed`), process.exit(r.status ?? 1));
};

const published = async (m) => {
  const res = await fetchRetry(`${registry}${m.name.replace('/', '%2f')}`);
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`${m.name}: registry answered ${res.status}`);
  return m.version in ((await res.json()).versions ?? {});
};

const publish = async (m) => {
  if (isUnreleased(m)) return console.log(`\n[${m.name}] 0.0.0 is unreleased, skipping publish`);
  if (await published(m)) return console.log(`\n[${m.name}] ${m.version} already published, skipping`);
  // PLT-215: publish our own deterministic tarball, so lockfile integrities match on every machine. Imported here so
  // `--list` and version-check run without scripts/node_modules (the CI select job installs nothing).
  const { packDeterministic } = await import('./pack.mjs');
  console.log(`\n[${m.name}] deterministic pack`);
  let tgz;
  try {
    tgz = packDeterministic(join(root, 'modules', m.dir), env);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  sh(m, ['publish', tgz, '--no-git-checks'], publishEnv);
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

// Lockfile guard: the pnpm store masks a changed tarball locally, so compare each @vsslicer/* integrity with what the registry serves now.
if (cmd === 'ci') {
  console.log('\n[checks] lockfile integrity');
  const served = new Map();
  for (const m of modules) {
    const res = await fetchRetry(`${registry}${m.name.replace('/', '%2f')}`);
    for (const [v, meta] of Object.entries(res.ok ? ((await res.json()).versions ?? {}) : {})) served.set(`${m.name}@${v}`, meta.dist?.integrity);
  }
  const problems = names.flatMap((n) => {
    const m = modules.find((x) => x.name === n);
    return integrityProblems(m.name, lockfileIntegrities(modFile(m, 'pnpm-lock.yaml') ?? ''), (name, v) => served.get(`${name}@${v}`));
  });
  if (problems.length) (problems.forEach((p) => console.error(`lockfile integrity: ${p}`)), process.exit(1));
}

// Negative checks over all modules: phantom dependencies fail the build, pnpm settings stay strict.
if (cmd === 'ci' || cmd === 'checks') {
  console.log('\n[checks] node --test phantom-dep + npmrc');
  const reg = modules.flatMap((m) =>
    registryProblems({ dir: m.dir, pkg: m.pkg, texts: Object.fromEntries(['.npmrc', 'pnpm-workspace.yaml', 'pnpm-lock.yaml'].map((f) => [f, modFile(m, f) ?? ''])) }),
  );
  const current = new Map(modules.map((m) => [m.name, m.version]));
  reg.push(...modules.flatMap((m) => stalePinProblems(m.name, lockfileIntegrities(modFile(m, 'pnpm-lock.yaml') ?? ''), current)));
  reg.push(...modules.flatMap((m) => prepackProblems(m.dir, m.pkg)));
  if (reg.length) (reg.forEach((p) => console.error(`registry: ${p}`)), process.exit(1));
  const r = spawnSync(process.execPath, ['--test', 'test/phantom-dep.test.mjs', 'test/npmrc.test.mjs'], { cwd: join(root, 'scripts'), stdio: 'inherit', env });
  if (r.status !== 0) (console.error('checks failed'), process.exit(r.status ?? 1));
  // licence fields, SPDX headers, ported-file provenance: tooling's bin from source, so it needs no install
  console.log('\n[checks] check-licence');
  const dirs = [...modules.map((m) => join(root, 'modules', m.dir)), join(root, 'fixtures', 'phantom-dep')];
  const l = spawnSync(process.execPath, [join(root, 'modules', 'tooling', 'tooling', 'bin', 'check-licence.mjs'), ...dirs], { stdio: 'inherit', env });
  if (l.status !== 0) (console.error('checks failed'), process.exit(l.status ?? 1));
  console.log('\n[checks] check-fixtures');
  const f = spawnSync(process.execPath, [join(root, 'scripts', 'check-fixtures.mjs'), root], { stdio: 'inherit', env });
  if (f.status !== 0) (console.error('checks failed'), process.exit(f.status ?? 1));
}
