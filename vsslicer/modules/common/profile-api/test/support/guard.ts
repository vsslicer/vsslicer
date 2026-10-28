// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawnSync } from 'node:child_process';
// file:// URLs, not paths: the child imports them, and a Windows path (D:\...) is not a valid ESM specifier
const root = new URL('../../', import.meta.url).href;
const tools = (f: string) => new URL(`../../tools/catalogue/${f}.ts`, import.meta.url).href;

/** Vitest timeout for a test that calls `guarded` up to 3 times: above the hang guard, since `spawnSync` blocks until the child exits. */
export const GUARDED_TIMEOUT = 300_000;

/**
 * Runs `body` in a child node process with `cpp`, `groups`, `cura`, `generate` and `prusa` (the catalogue tools), `load(relativePath)` for any other module of the package and `src` (the stdin text)
 * in scope. The child is killed after `hangMs` (a hang guard, never an assertion on how long the work took): a
 * quadratic scanner on these inputs runs for minutes, so it fails here. Returns "Name: message" if `body` threw.
 */
export const guarded = (body: string, src = '', hangMs = 60_000): string | undefined => {
  const script = `
    const load = (rel) => import(new URL(rel, ${JSON.stringify(root)}).href);
    const cpp = await import(${JSON.stringify(tools('cpp'))});
    const groups = await import(${JSON.stringify(tools('groups'))});
    const cura = await import(${JSON.stringify(tools('cura'))});
    const generate = await import(${JSON.stringify(tools('generate'))});
    const prusa = await import(${JSON.stringify(tools('prusa'))});
    const src = await new Promise((r) => { let s = ''; process.stdin.setEncoding('utf8'); process.stdin.on('data', (c) => (s += c)).on('end', () => r(s)); });
    try { await (async () => { ${body} })(); } catch (e) { process.stdout.write('threw ' + e.name + ': ' + e.message); }
  `;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    input: src,
    timeout: hangMs,
    encoding: 'utf8',
    maxBuffer: 1 << 20,
  });
  if (r.error || r.status !== 0) throw new Error(`child did not finish: ${r.error?.message ?? r.stderr.slice(0, 500)}`);
  return r.stdout.startsWith('threw ') ? r.stdout.slice(6) : undefined;
};
