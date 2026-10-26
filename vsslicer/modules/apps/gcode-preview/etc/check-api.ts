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

/** Removed report lines other than the version constant itself: any one is a breaking change. */
export const breakingLines = (oldReport: string, next: string) => {
  const kept = new Set(next.split('\n'));
  return oldReport.split('\n').filter((l) => l.trim() && !VERSION.test(l) && !kept.has(l));
};

/** Problems between the report at the base ref and now (empty: fine). */
export const apiProblems = (oldReport: string, next: string) => {
  const before = Number(VERSION.exec(oldReport)?.[1] ?? 0);
  const after = Number(VERSION.exec(next)?.[1] ?? 0);
  const broken = breakingLines(oldReport, next);
  return broken.length && after <= before
    ? [
        `breaking API change without raising GCODE_PREVIEW_API_VERSION (${before}); removed or changed: ${broken.slice(0, 3).join(' | ')}`,
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
