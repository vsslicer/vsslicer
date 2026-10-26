#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: third-party-notices [--out THIRD-PARTY-NOTICES.md] [metafile...]   (default metafile: dist/extension.meta.json)
// Run after bundling (vsslicer-bundle writes the esbuild metafile). Lists every third-party package that
// esbuild inlined, checks each licence against the allow-list (bin/spdx.mjs) and writes the notices file.
// Failures name the package and version and exit 1 without writing. Output is deterministic: sorted by
// name@version, no timestamps. Skipped: the module's own sources (no node_modules segment in the path).
// @vsslicer/* (our own, AGPL-3.0-or-later) skip the licence check, but any NOTICE, NOTICE.md or PROVENANCE.md
// they ship (at most 1 MiB each) is copied in under the package's name.
// A package that ships no licence file can get one from the module: package.json
// "vsslicer": {"licenceTexts": {"name@exact-version": "path/relative/to/package.json"}}. The text must contain
// one of the package's SPDX ids; an entry for a package@version that is not bundled fails (stale).
// shortcut: a "SEE LICENSE IN <file>" or otherwise non-SPDX licence cannot be classified, so it fails; add the
// package to a reviewed exception list only if that ever happens.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
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

// The text names the licence if it has the SPDX id as a whole word, or (many real texts omit the id) a
// phrase from the licence's standard wording. shortcut: phrases for the common ids only; add more on demand.
const WORDING = {
  mit: ['permission is hereby granted, free of charge'],
  isc: ['permission to use, copy, modify, and/or distribute this software'],
  'apache-2.0': ['apache license version 2.0', 'apache license, version 2.0'],
  'bsd-2-clause': ['in source and binary forms'],
  'bsd-3-clause': ['in source and binary forms'],
};
// BSD-2 and BSD-3 differ only by the no-endorsement clause ("neither the name of", "names of ... may not be used to endorse"): BSD-3 needs it, BSD-2 must lack it.
const ENDORSE = 'endorse';
const names = (text, id) => {
  const lc = id.toLowerCase();
  const esc = lc.replace(/[.+-]/g, '\\$&');
  if (new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`).test(text)) return true;
  const worded = (WORDING[lc] ?? []).some((w) => text.includes(w));
  if (lc === 'bsd-3-clause') return worded && text.includes(ENDORSE);
  if (lc === 'bsd-2-clause') return worded && !text.includes(ENDORSE);
  return worded;
};

const textFiles = (dir) =>
  readdirSync(dir)
    .filter((f) => /^(licen[cs]e|copying|notice)([.-].*)?$/i.test(f))
    .sort();

const MAX_NOTICE_BYTES = 1024 * 1024;
const fenced = (f, path) => {
  const text = readFileSync(path, 'utf8').replace(/\r\n?/g, '\n').trim();
  const fence = '`'.repeat(Math.max(3, ...(text.match(/`+/g) ?? []).map((r) => r.length + 1)));
  return `### ${f}\n\n${fence}text\n${text}\n${fence}\n`;
};

/** @returns {{markdown: string, problems: string[]}} */
export const notices = (metafiles, cwd = process.cwd()) => {
  const packages = new Map();
  const own = new Map(); // @vsslicer/*: no licence check, but their upstream notices are copied
  for (const m of metafiles)
    for (const input of Object.keys(read(m).inputs)) {
      const file = realpathSync(resolve(cwd, input.replace(/^[a-z-]+:/, '')));
      if (!file.split(sep).includes('node_modules')) continue;
      const o = owner(file);
      if (!o) continue;
      if (o.pkg.name.startsWith('@vsslicer/')) {
        own.set(`${o.pkg.name}@${o.pkg.version}`, o);
        continue;
      }
      packages.set(`${o.pkg.name}@${o.pkg.version}`, o);
    }
  const problems = [];
  const vendored = existsSync(join(cwd, 'package.json'))
    ? (read(join(cwd, 'package.json')).vsslicer?.licenceTexts ?? {})
    : {};
  for (const key of Object.keys(vendored))
    if (!packages.has(key)) problems.push(`${key}: stale licenceTexts entry (package@version is not bundled)`);
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
    const extra = vendored[key];
    if (!files.length && extra === undefined) problems.push(`${key}: no LICENSE/COPYING/NOTICE file in the package`);
    const sources = files.map((f) => [f, join(dir, f)]);
    if (!files.length && extra !== undefined) {
      const path = resolve(cwd, extra);
      if (!existsSync(path)) problems.push(`${key}: licenceTexts file ${extra} not found`);
      else if (!realpathSync(path).startsWith(realpathSync(cwd) + sep))
        problems.push(`${key}: licenceTexts file ${extra} is outside the module directory`);
      else {
        const ids = (expr ?? '').split(/[^A-Za-z0-9.+-]+/).filter((t) => t && !/^(and|or|with)$/i.test(t));
        const text = readFileSync(path, 'utf8').toLowerCase().replace(/\s+/g, ' ');
        if (!ids.some((id) => names(text, id)))
          problems.push(`${key}: licenceTexts file ${extra} does not name the licence "${expr}"`);
        sources.push([`${extra} (vendored)`, path]);
      }
    }
    const body = sources.map(([f, path]) => fenced(f, path));
    return `## ${key}\n\nLicence: ${expr ?? 'none declared'}\n\n${body.join('\n')}`;
  });
  for (const key of [...own.keys()].sort()) {
    const { dir } = own.get(key);
    const body = [];
    for (const f of readdirSync(dir)
      .filter((f) => /^(notice(\.md)?|provenance\.md)$/i.test(f))
      .sort()) {
      if (statSync(join(dir, f)).size > MAX_NOTICE_BYTES) {
        problems.push(`${key}: ${f} is larger than ${MAX_NOTICE_BYTES} bytes`);
        continue;
      }
      body.push(fenced(f, join(dir, f)));
    }
    if (body.length)
      sections.push(`## ${key}\n\nBundled VSSlicer package; upstream notices it ships.\n\n${body.join('\n')}`);
  }
  sections.sort();
  const intro = '# Third-party notices\n\nThis extension bundles the third-party packages listed below.\n';
  const markdown = `${intro}\n${sections.length ? sections.join('\n') : 'No third-party packages are bundled.\n'}`;
  return { markdown, problems };
};

const main = () => {
  const args = process.argv.slice(2);
  const o = args.indexOf('--out');
  const out = o >= 0 ? args.splice(o, 2)[1] : 'THIRD-PARTY-NOTICES.md';
  const { markdown, problems } = notices(args.length ? args : ['dist/extension.meta.json']);
  if (problems.length) {
    problems.forEach((p) => console.error(`third-party-notices: ${p}`));
    process.exit(1);
  }
  writeFileSync(out, markdown);
};

if (process.argv[1] && import.meta.filename === realpathSync(process.argv[1])) {
  try {
    main();
  } catch (e) {
    console.error(`third-party-notices: ${e.message}`);
    process.exit(1);
  }
}
