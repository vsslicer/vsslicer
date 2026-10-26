#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: vsslicer-package   (run in an extension module, after its build)
// Builds <name>-<version>.vsix in the current directory with @vscode/vsce (--no-dependencies: the bundle has
// everything, node_modules is never walked), prints its size and asserts, exiting 1 with one line per problem:
//   manifest  license AGPL-3.0-or-later, publisher, repository pointing at the tag <name>@<version>,
//             "vsslicer": { "sizeBudgetKB": n }
//   content   exactly extension/dist/<bundles> (.js/.css, no .map/.meta.json), extension/package.json, LICENSE,
//             THIRD-PARTY-NOTICES.md, README.md, CHANGELOG.md, declared assets (icon, files named in contributes,
//             files reached by a relative $ref from a contributes.jsonValidation schema)
//             and the VSIX's own manifest files; nothing else (no node_modules, src, tests, maps)
//   size      the VSIX is within the budget
// "vsslicer": { "targets": ["linux-x64", "win32-x64"] } builds one <name>-<target>-<version>.vsix per target
// (vsce --target), each checked on its own with the same rules; without targets: one universal VSIX.
// What goes in is decided by the module's `.vscodeignore` (vsce ignores negations in package.json `files`).
// Packaging runs in a temporary copy: vsce rejects scoped names like @vsslicer/x, so the copy gets the unscoped
// name and no `files` (vsce refuses `files` together with .vscodeignore).
// "vsslicer": { "extensionName": "printers" } overrides that name, so the id is <publisher>.printers and the file
// printers-<version>.vsix (vsce's rule for name: ^[a-z0-9][a-z0-9-]*$, at most 214 characters); the tag stays <module>@<version>.
import { createRequire } from 'node:module';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

const { createVSIX } = createRequire(import.meta.url)('@vscode/vsce');

/** Names of the entries of a zip, from its central directory. */
export const zipEntries = (file) => {
  const b = readFileSync(file);
  let e = b.length - 22;
  while (e >= 0 && b.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error(`${file}: not a zip file`);
  const names = [];
  for (let n = b.readUInt16LE(e + 10), p = b.readUInt32LE(e + 16); n > 0; n--) {
    const len = b.readUInt16LE(p + 28);
    names.push(b.toString('utf8', p + 46, p + 46 + len));
    p += 46 + len + b.readUInt16LE(p + 30) + b.readUInt16LE(p + 32);
  }
  return names;
};

const shortName = (pkg) => pkg.name.replace(/^@[^/]+\//, '');
/** The name written into the packaging copy: the "vsslicer.extensionName" override, else the unscoped npm name. */
export const extensionName = (pkg) => {
  const o = pkg.vsslicer?.extensionName;
  if (o === undefined) return shortName(pkg);
  if (typeof o !== 'string' || o.length > 214 || !/^[a-z0-9][a-z0-9-]*$/.test(o))
    throw new Error(
      `package.json "vsslicer.extensionName" must match ^[a-z0-9][a-z0-9-]*$ and be at most 214 characters, is ${JSON.stringify(o)?.slice(0, 60)}`,
    );
  return o;
};
const norm = (p) => p.replace(/^\.\//, '');

// shortcut: any string in `contributes` or `icon` that names an existing file is an asset; upgrade if a
// contribution ever holds a string that is a file name without being an asset
const assets = (pkg, cwd) => {
  const found = new Set();
  const walk = (v) => {
    if (typeof v === 'string') {
      if (existsSync(join(cwd, norm(v))) && statSync(join(cwd, norm(v))).isFile()) found.add(norm(v));
    } else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(pkg.icon);
  walk(pkg.contributes);
  return [...found];
};

const REF_FILE_BYTES = 1024 * 1024; // size cap per scanned schema
const REF_NODES = 10000; // $ref values read per schema
const REF_FILES = 64; // schema files reached in all
const REF_DEPTH = 3; // contributed schema -> ref -> ref -> ref

// A relative $ref in a contributed schema names a file the schema needs at runtime, so it ships too. Chosen over
// a package.json asset list: nothing to keep in sync by hand. Refs are read iteratively (no recursion on input),
// only from contributes.jsonValidation files and the files they reach, never past REF_DEPTH.
/** @returns {{ files: string[], problems: string[] }} files reached by $ref (relative to cwd) and one message per bad ref */
export const schemaRefs = (pkg, cwd) => {
  const root = realpathSync(cwd);
  const files = new Set();
  const problems = [];
  const seen = new Set();
  let queue = (pkg.contributes?.jsonValidation ?? [])
    .map((j) => j?.url)
    .filter((u) => typeof u === 'string' && existsSync(join(cwd, norm(u))) && statSync(join(cwd, norm(u))).isFile())
    .map((u) => ({ rel: norm(u), depth: 0 }));
  while (queue.length) {
    const next = [];
    for (const { rel, depth } of queue) {
      if (seen.has(rel)) continue;
      seen.add(rel);
      const abs = join(cwd, rel);
      if (statSync(abs).size > REF_FILE_BYTES) {
        problems.push(`ref: ${rel} is larger than ${REF_FILE_BYTES} bytes`);
        continue;
      }
      let doc;
      try {
        doc = JSON.parse(readFileSync(abs, 'utf8'));
      } catch {
        if (depth === 0) problems.push(`ref: ${rel} is not valid JSON`);
        continue; // a reached file need not be JSON
      }
      const stack = [doc];
      let nodes = 0;
      for (let v; stack.length && (v = stack.pop()) !== undefined;) {
        if (!v || typeof v !== 'object') continue;
        for (const [k, c] of Object.entries(v)) {
          if (k !== '$ref' || typeof c !== 'string') {
            stack.push(c);
            continue;
          }
          if (++nodes > REF_NODES) {
            problems.push(`ref: ${rel} has more than ${REF_NODES} $ref values`);
            stack.length = 0;
            break;
          }
          const path = c.split('#')[0];
          if (!path) continue; // same-file pointer
          if (isAbsolute(path) || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
            problems.push(`ref: ${rel} has an absolute $ref ${JSON.stringify(c)}`);
            continue;
          }
          const target = resolve(dirname(abs), path);
          let real;
          try {
            real = realpathSync(target);
          } catch {
            problems.push(`ref: ${rel} $ref ${JSON.stringify(c)} names a missing file`);
            continue;
          }
          const inside = relative(root, real);
          if (inside.startsWith('..') || isAbsolute(inside) || !statSync(real).isFile()) {
            problems.push(`ref: ${rel} $ref ${JSON.stringify(c)} leaves the extension folder or is not a file`);
            continue;
          }
          const r = relative(resolve(cwd), target).split('\\').join('/');
          if (!files.has(r) && files.size >= REF_FILES) {
            problems.push(`ref: more than ${REF_FILES} files reached by $ref`);
            continue;
          }
          files.add(r);
          if (depth + 1 < REF_DEPTH) next.push({ rel: r, depth: depth + 1 });
        }
      }
    }
    queue = next;
  }
  return { files: [...files], problems };
};

/** @returns {string[]} one message per problem with package.json */
export const checkManifest = (pkg) => {
  const problems = [];
  const tag = `${shortName(pkg)}@${pkg.version}`;
  const url = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
  if (pkg.license !== 'AGPL-3.0-or-later')
    problems.push(`manifest: license must be "AGPL-3.0-or-later", is ${JSON.stringify(pkg.license)}`);
  if (!pkg.publisher) problems.push('manifest: publisher is missing');
  if (!url) problems.push('manifest: repository is missing');
  else if (!url.split('/').includes(tag))
    problems.push(`manifest: repository ${url} does not point at the release tag ${tag}`);
  const budget = pkg.vsslicer?.sizeBudgetKB;
  if (!(budget > 0)) problems.push('manifest: "vsslicer": { "sizeBudgetKB": <number> } is missing');
  return problems;
};

/** @returns {string[]} one message per unexpected or missing entry */
export const checkContent = (names, pkg, cwd) => {
  const refs = schemaRefs(pkg, cwd);
  const fixed = [
    '[Content_Types].xml',
    'extension.vsixmanifest',
    'extension/package.json',
    'extension/LICENSE.txt', // vsce renames LICENSE
    'extension/THIRD-PARTY-NOTICES.md',
    'extension/readme.md',
    'extension/changelog.md',
    ...assets(pkg, cwd).map((a) => `extension/${a}`),
    ...refs.files.map((a) => `extension/${a}`),
  ];
  const main = pkg.main ? [`extension/${norm(pkg.main)}`] : []; // extension packs have no main
  const bundle = (n) => /^extension\/dist\/[^/]+\.(js|css)$/.test(n) && !n.endsWith('.meta.json');
  const got = new Set(names);
  return [
    ...refs.problems,
    ...[...fixed, ...main].filter((n) => !got.has(n)).map((n) => `content: missing ${n}`),
    ...names.filter((n) => !fixed.includes(n) && !bundle(n)).map((n) => `content: unexpected ${n}`),
  ];
};

/** Builds the VSIX (for `target`, if given) in `cwd`, checks it and returns { file, kb, budget, problems }. */
export const pack = async (cwd = process.cwd(), target) => {
  const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const name = extensionName(pkg); // throws before vsce runs
  const problems = checkManifest(pkg);
  const file = join(cwd, `${[name, target, pkg.version].filter(Boolean).join('-')}.vsix`);
  const stage = mkdtempSync(join(tmpdir(), 'vsslicer-package-'));
  try {
    cpSync(cwd, stage, { recursive: true, filter: (s) => !/(^|[\\/])(node_modules|\.git|coverage)$|\.vsix$/.test(s) });
    writeFileSync(join(stage, 'package.json'), JSON.stringify({ ...pkg, files: undefined, name }));
    await createVSIX({
      cwd: stage,
      dependencies: false,
      packagePath: join(stage, 'out.vsix'),
      allowMissingRepository: true,
      target,
    });
    renameSync(join(stage, 'out.vsix'), file);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
  const kb = statSync(file).size / 1024;
  problems.push(...checkContent(zipEntries(file), pkg, cwd));
  const budget = pkg.vsslicer?.sizeBudgetKB;
  if (budget > 0 && kb > budget) problems.push(`size: ${kb.toFixed(1)} KB exceeds the budget of ${budget} KB`);
  return { file, kb, budget, problems };
};

/** pack() once per declared target, or once for the universal VSIX. */
export const packAll = async (cwd = process.cwd()) => {
  const { targets } = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')).vsslicer ?? {};
  const results = [];
  for (const t of targets?.length ? targets : [undefined]) results.push(await pack(cwd, t));
  return results;
};

// argv[1] is the node_modules/.bin symlink when run as a bin
if (process.argv[1] && import.meta.filename === realpathSync(process.argv[1])) {
  let failed = false;
  const results = await packAll().catch((e) => {
    console.error(`vsslicer-package: ${e.message}`); // user errors (bad target, no package.json): no stack trace
    process.exit(1);
  });
  for (const { file, kb, budget, problems } of results) {
    console.log(`${file}: ${kb.toFixed(1)} KB (budget ${budget ?? '?'} KB)`);
    if (problems.length) {
      console.error(`${file}:\n${problems.join('\n')}`);
      failed = true;
    }
  }
  if (failed) process.exit(1);
}
