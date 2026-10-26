#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: check-licence [dir...]   (default: the current directory; each dir is one module)
// Rules, each failure names the file and the rule:
//   package-license  package.json has "license": "AGPL-3.0-or-later", or "AGPL-3.0-only" when its `files` lists an
//                    existing PROVENANCE.md (Q20/Q21 data packages)
//   spdx-header      every source file has the SPDX line matching the package licence (same id) within its first 5 lines
//   ported-copyright every line "Ported from <project>@<commit>:<path>" has a line containing "Copyright"
//                    within 5 lines before or after it (D2: provenance plus the upstream notice)
// Source files: .ts .tsx .js .mjs .cjs .sh .glsl .wgsl. Ignored: node_modules, dist, coverage, .git, the generated or
// downloaded .vscode-test, test-results, dist-test, .cache and test/fixtures (deliberate violations, checked by tooling's own tests), at any depth below a module root.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const orLater = 'AGPL-3.0-or-later';
const only = 'AGPL-3.0-only';
const maxPackageJson = 1024 * 1024;
const sources = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.sh', '.glsl', '.wgsl']);
const ignoredDirs = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  '.vscode-test',
  'test-results',
  'dist-test',
  '.cache',
]);
const ported = /Ported from \S+@[0-9a-f]+:\S+/;
const window = 5;

const walk = (root, dir = root) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory())
      return ignoredDirs.has(e.name) || relative(root, p) === join('test', 'fixtures') ? [] : walk(root, p);
    return sources.has(extname(e.name)) ? [p] : [];
  });

/** @returns {string[]} one message per violation, empty when the module passes */
export const check = (root) => {
  const problems = [];
  const fail = (file, rule, msg) =>
    problems.push(`${relative(process.cwd(), file).split(sep).join('/')}: ${rule}: ${msg}`);
  const pkg = join(root, 'package.json');
  let license = orLater;
  try {
    if (statSync(pkg).size > maxPackageJson) throw new Error(`larger than ${maxPackageJson} bytes`);
    const json = JSON.parse(readFileSync(pkg, 'utf8'));
    if (json.license === only) {
      license = only;
      const listed = Array.isArray(json.files) && json.files.includes('PROVENANCE.md');
      if (!listed || !existsSync(join(root, 'PROVENANCE.md')))
        fail(pkg, 'package-license', `"${only}" is allowed only when "files" lists an existing PROVENANCE.md`);
    } else if (json.license !== orLater)
      fail(
        pkg,
        'package-license',
        `package.json must have "license": "${orLater}" (or "${only}" with a PROVENANCE.md)`,
      );
  } catch (e) {
    fail(pkg, 'package-license', `cannot read package.json (${e.message})`);
  }
  const spdx = `SPDX-License-Identifier: ${license}`;
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    if (!lines.slice(0, 5).some((l) => l.trim().endsWith(spdx)))
      fail(file, 'spdx-header', `missing "${spdx}" in the first 5 lines`);
    lines.forEach((l, i) => {
      if (ported.test(l) && !lines.slice(Math.max(0, i - window), i + window + 1).some((x) => /Copyright/.test(x)))
        fail(
          file,
          'ported-copyright',
          `line ${i + 1}: "Ported from" without an upstream "Copyright" line within ${window} lines`,
        );
    });
  }
  return problems;
};

if (process.argv[1] && import.meta.filename === realpathSync(process.argv[1])) {
  const problems = process.argv.slice(2).length ? process.argv.slice(2).flatMap(check) : check('.');
  problems.forEach((p) => console.error(p));
  if (problems.length) {
    console.error(`check-licence: ${problems.length} problem(s)`);
    process.exit(1);
  }
}
