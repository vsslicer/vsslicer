#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: third-party-notices [--out THIRD-PARTY-NOTICES.md] [metafile...]   (default metafile: dist/extension.meta.json)
// Run after bundling (vsslicer-bundle writes the esbuild metafile). Lists every third-party package that
// esbuild inlined, checks each licence against the allow-list (bin/spdx.mjs) and writes the notices file.
// Failures name the package and version and exit 1 without writing. Output is deterministic: sorted by
// name@version, no timestamps. Skipped: the module's own sources (no node_modules segment in the path)
// and @vsslicer/* (our own, AGPL-3.0-or-later).
// shortcut: a "SEE LICENSE IN <file>" or otherwise non-SPDX licence cannot be classified, so it fails; add the
// package to a reviewed exception list only if that ever happens.
import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { isAllowed } from './spdx.mjs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));

// nearest package.json with a name above `file` (inner {"type":"module"} stubs have none)
const owner = (file) => {
  for (let d = dirname(file); dirname(d) !== d; d = dirname(d)) {
    const p = join(d, 'package.json');
    if (existsSync(p)) {
      const pkg = read(p);
      if (pkg.name) return { dir: d, pkg };
    }
  }
  return undefined;
};

const licenceExpression = ({ license, licenses }) => {
  const one = (l) => (typeof l === 'string' ? l : l?.type);
  if (license !== undefined) return one(license);
  if (Array.isArray(licenses) && licenses.length) return licenses.map(one).join(' OR ');
  return undefined;
};

const textFiles = (dir) =>
  readdirSync(dir)
    .filter((f) => /^(licen[cs]e|copying|notice)([.-].*)?$/i.test(f))
    .sort();

/** @returns {{markdown: string, problems: string[]}} */
export const notices = (metafiles, cwd = process.cwd()) => {
  const packages = new Map();
  for (const m of metafiles)
    for (const input of Object.keys(read(m).inputs)) {
      const file = realpathSync(resolve(cwd, input.replace(/^[a-z-]+:/, '')));
      if (!file.split(sep).includes('node_modules')) continue;
      const o = owner(file);
      if (!o || o.pkg.name.startsWith('@vsslicer/')) continue;
      packages.set(`${o.pkg.name}@${o.pkg.version}`, o);
    }
  const problems = [];
  const sections = [...packages.keys()].sort().map((key) => {
    const { dir, pkg } = packages.get(key);
    const expr = licenceExpression(pkg);
    let good;
    try {
      good = expr !== undefined && isAllowed(expr);
    } catch (e) {
      problems.push(`${key}: cannot parse licence "${expr}" (${e.message})`);
      good = true; // reported already
    }
    if (!good)
      problems.push(`${key}: licence ${expr === undefined ? 'missing' : `"${expr}"`} is not on the allow-list`);
    const files = textFiles(dir);
    if (!files.length) problems.push(`${key}: no LICENSE/COPYING/NOTICE file in the package`);
    const body = files.map((f) => {
      const text = readFileSync(join(dir, f), 'utf8').replace(/\r\n?/g, '\n').trim();
      const fence = '`'.repeat(Math.max(3, ...(text.match(/`+/g) ?? []).map((r) => r.length + 1)));
      return `### ${f}\n\n${fence}text\n${text}\n${fence}\n`;
    });
    return `## ${key}\n\nLicence: ${expr ?? 'none declared'}\n\n${body.join('\n')}`;
  });
  const intro = '# Third-party notices\n\nThis extension bundles the third-party packages listed below.\n';
  const markdown = `${intro}\n${sections.length ? sections.join('\n') : 'No third-party packages are bundled.\n'}`;
  return { markdown, problems };
};

if (process.argv[1] && import.meta.filename === realpathSync(process.argv[1])) {
  const args = process.argv.slice(2);
  const o = args.indexOf('--out');
  const out = o >= 0 ? args.splice(o, 2)[1] : 'THIRD-PARTY-NOTICES.md';
  const { markdown, problems } = notices(args.length ? args : ['dist/extension.meta.json']);
  if (problems.length) {
    problems.forEach((p) => console.error(`third-party-notices: ${p}`));
    process.exit(1);
  }
  writeFileSync(out, markdown);
}
