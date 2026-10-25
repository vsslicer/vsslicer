// SPDX-License-Identifier: AGPL-3.0-or-later
// Pure logic for versioning, release tags, lockfile integrity and registry checks: no git, no network, no file system.

export const LOCAL_REGISTRY = 'http://localhost:4873/';

const globToRe = (g) =>
  new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\0').replace(/\*/g, '[^/]*').replace(/\0/g, '.*')}$`);
const matches = (entry, file) => {
  const e = entry.replace(/^\.\//, '').replace(/\/$/, '');
  return globToRe(e).test(file) || file.startsWith(`${e}/`);
};

/**
 * Does a change to `file` (module-relative) alter what the module publishes?
 * shortcut: `files` entries are matched with a small glob (* and **), not npm's full ignore rules; upgrade if a module needs more.
 * Build output (dist) is git-ignored, so `src/` stands in for it. Tests, fixtures, docs and other Markdown not in `files` are exempt.
 */
export function isPublishedChange(file, files = []) {
  if (file === 'package.json') return true;
  if (file === 'CHANGELOG.md' || /^(test|tests|fixtures|docs)\//.test(file) || /(^|\/)fixtures\//.test(file)) return false;
  const positive = files.filter((f) => !f.startsWith('!'));
  const negative = files.filter((f) => f.startsWith('!')).map((f) => f.slice(1));
  if (negative.some((n) => matches(n, file))) return false;
  if (file.startsWith('src/') && !/\.(test|spec)\.[cm]?[jt]s$/.test(file)) return true;
  return positive.some((p) => matches(p, file));
}

export const changelogSection = (changelog, version) => {
  const lines = changelog.split('\n');
  const head = new RegExp(`^##\\s+\\[?v?${version.replace(/[.+]/g, '\\$&')}\\]?(\\s|$)`);
  const start = lines.findIndex((l) => head.test(l));
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines.slice(start, end < 0 ? undefined : end).join('\n').trim();
};

export const releaseTag = (dir, version) => `${dir}@${version}`;

/** m: { dir, changed: module-relative paths changed since base, files, baseVersion (null: new module), version, changelog } -> problems */
export function versionProblems(m) {
  const out = [];
  const touched = m.changed.filter((f) => isPublishedChange(f, m.files));
  if (m.baseVersion !== null && touched.length === 0) return out;
  const why = m.baseVersion === null ? 'new module' : `published files changed (${touched.slice(0, 3).join(', ')}${touched.length > 3 ? ', ...' : ''})`;
  if (m.baseVersion === m.version) out.push(`${m.dir}: ${why} but version is still ${m.version}; bump it in package.json`);
  else if (changelogSection(m.changelog ?? '', m.version) === null) out.push(`${m.dir}: ${why}; CHANGELOG.md has no "## ${m.version}" entry`);
  return out;
}

/** '@vsslicer/*' packages entries of a pnpm-lock.yaml -> Map('@vsslicer/x@1.2.3' -> integrity) */
export function lockfileIntegrities(text) {
  const out = new Map();
  for (const m of text.matchAll(/^ {2}'?(@vsslicer\/[^@'\s]+@[^':\s]+)'?:\n {4}resolution: \{integrity: (\S+?)[,}]/gm)) out.set(m[1], m[2]);
  return out;
}

/** lookup(name, version) -> the registry's dist.integrity or undefined. dependent: module name whose lockfile this is. */
export function integrityProblems(dependent, entries, lookup) {
  const out = [];
  for (const [spec, integrity] of entries) {
    const at = spec.lastIndexOf('@');
    const served = lookup(spec.slice(0, at), spec.slice(at + 1));
    if (served === undefined) out.push(`${dependent}: lockfile pins ${spec}, which the registry does not serve`);
    else if (served !== integrity)
      out.push(`${dependent} and ${spec.slice(0, at)}: ${dependent}'s lockfile has integrity ${integrity} for ${spec} but the registry serves ${served}; ${spec.slice(0, at)} changed after publishing without a version bump`);
  }
  return out;
}

/** current: Map(module name -> package.json version). A clean registry serves current versions only (D12), so any other pin cannot install there. */
export function stalePinProblems(dependent, entries, current) {
  const out = [];
  for (const spec of entries.keys()) {
    const at = spec.lastIndexOf('@');
    const name = spec.slice(0, at);
    const now = current.get(name);
    if (now !== undefined && now !== spec.slice(at + 1))
      out.push(`${dependent} and ${name}: ${dependent}'s lockfile pins ${spec}, but ${name}'s current is ${now}; raise the range, re-lock and bump ${dependent}`);
  }
  return out;
}

/** m: { dir, pkg, texts: { fileName: content } for .npmrc, pnpm-workspace.yaml, pnpm-lock.yaml } -> problems */
export function registryProblems(m) {
  const out = [];
  if (m.pkg.publishConfig?.registry !== LOCAL_REGISTRY) out.push(`${m.dir}: publishConfig.registry must be ${LOCAL_REGISTRY}`);
  if (!new RegExp(`^@vsslicer:registry=${LOCAL_REGISTRY}\\s*$`, 'm').test(m.texts['.npmrc'] ?? '')) out.push(`${m.dir}: .npmrc must contain @vsslicer:registry=${LOCAL_REGISTRY}`);
  for (const [file, text] of Object.entries({ 'package.json': JSON.stringify(m.pkg), ...m.texts }))
    if (/@vsslicer.*registry\.npmjs\.org|registry\.npmjs\.org.*@vsslicer/.test(text)) out.push(`${m.dir}: ${file} references registry.npmjs.org for @vsslicer`);
  return out;
}

/** A module whose `files` ship build output must build in `prepack`, or a plain `pnpm publish` ships a stale or missing dist. */
export function prepackProblems(dir, pkg) {
  const ships = (pkg.files ?? []).some((f) => /^(\.\/)?(dist|build|out)(\/|$)/.test(f));
  return ships && !/\bbuild\b/.test(pkg.scripts?.prepack ?? '') ? [`${dir}: package.json ships build output but has no prepack that runs the build`] : [];
}
