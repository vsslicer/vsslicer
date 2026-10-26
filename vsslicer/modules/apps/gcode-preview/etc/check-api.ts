// SPDX-License-Identifier: AGPL-3.0-or-later
// Semver gate for the public contract (GCP-54). `pnpm api:check` rebuilds the api-extractor report and fails if it
// differs from etc/gcode-preview.api.md (an API change must be committed on purpose: `pnpm api:update`). With
// `--base <git-ref>` it also fails when the report lost or changed a line against that ref and
// GCODE_PREVIEW_API_VERSION (the contract's major) was not raised.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REPORT = 'etc/gcode-preview.api.md';
const VERSION = /GCODE_PREVIEW_API_VERSION = (\d+)/;

// Interfaces other extensions build and pass in: a new required member there breaks every caller (SP11 audit 13).
const CALLER_BUILT = new Set(['PrintPosition', 'OpenOptions']);

/** Body lines of caller-built interfaces as `[interface, line]` pairs, so a line is compared within its own interface. */
const callerBuiltLines = (report: string) => {
  let name: string | undefined;
  const out: [string, string][] = [];
  for (const l of report.split('\n')) {
    const open = /^export interface (\w+)/.exec(l);
    if (open) name = CALLER_BUILT.has(open[1]!) ? open[1] : undefined;
    else if (l.startsWith('}')) name = undefined;
    else if (name) out.push([name, l]);
  }
  return out;
};

/** Added lines that are required members (no `?`) of a caller-built interface. shortcut: the inner lines of a
 * multi-line object type (`view?: {`) read as members, so they fail closed; parse the members if that bites. */
const addedRequired = (oldReport: string, next: string) => {
  const had = new Set(callerBuiltLines(oldReport).map(([n, l]) => `${n}\0${l}`));
  return callerBuiltLines(next)
    .filter(([n, l]) => {
      const member = l.trim();
      return member && !member.startsWith('//') && !/^(readonly\s+)?[\w$]+\?/.test(member) && !had.has(`${n}\0${l}`);
    })
    .map(([, l]) => l);
};

/** Removed report lines other than the version constant itself, and new required members of caller-built
 * interfaces: any one is a breaking change. */
export const breakingLines = (oldReport: string, next: string) => {
  const kept = new Set(next.split('\n'));
  return [
    ...oldReport.split('\n').filter((l) => l.trim() && !VERSION.test(l) && !kept.has(l)),
    ...addedRequired(oldReport, next),
  ];
};

/** Problems between the report at the base ref and now (empty: fine). */
export const apiProblems = (oldReport: string, next: string) => {
  const before = Number(VERSION.exec(oldReport)?.[1] ?? 0);
  const after = Number(VERSION.exec(next)?.[1] ?? 0);
  const broken = breakingLines(oldReport, next);
  return broken.length && after <= before
    ? [
        `breaking API change without raising GCODE_PREVIEW_API_VERSION (${before}); removed, changed or newly required:${broken.slice(0, 3).join(' | ')}`,
      ]
    : [];
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const update = args.includes('--update');
  const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : undefined;
  const run = (cmd: string, a: string[]) => {
    if (spawnSync(cmd, a, { stdio: 'inherit', shell: process.platform === 'win32' }).status !== 0) process.exit(1);
  };
  run('pnpm', ['exec', 'tsc', '-p', 'tsconfig.api.json']);
  run('pnpm', ['exec', 'api-extractor', 'run', ...(update ? ['--local'] : [])]);
  if (base) {
    let old: string | undefined;
    try {
      old = execFileSync('git', ['show', `${base}:./${REPORT}`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      console.log(`api-check: no report at ${base}, nothing to compare`);
    }
    const problems = old === undefined ? [] : apiProblems(old, readFileSync(REPORT, 'utf8'));
    problems.forEach((p) => console.error(`api-check: ${p}`));
    if (problems.length) process.exit(1);
  }
  console.log('api-check: ok');
}
