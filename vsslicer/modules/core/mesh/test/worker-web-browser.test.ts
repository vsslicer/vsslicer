// SPDX-License-Identifier: AGPL-3.0-or-later
/* eslint-disable @typescript-eslint/no-explicit-any */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, expect, test } from 'vitest';

// Needs Playwright and its Chromium, which the mesh module does not depend on: set PLAYWRIGHT_MODULE to the
// package's entry file (for example the one in modules/test-webview) or add @playwright/test as a dev dependency.
// Without either the test is skipped (the title says why); a PLAYWRIGHT_MODULE that does not import fails the file.
const spec = process.env['PLAYWRIGHT_MODULE'] ?? '@playwright/test';
const requested = process.env['PLAYWRIGHT_MODULE'] !== undefined;
// An explicitly requested run must not turn into a silent skip.
const playwright = await import(/* @vite-ignore */ spec).catch((e: unknown) => {
  if (requested) throw new Error(`PLAYWRIGHT_MODULE=${spec} cannot be imported: ${(e as Error).message}`);
  return undefined;
});

const fixtures = new URL('./fixtures/stl-obj/', import.meta.url);
const names = ['box-binary.stl', 'box-ascii.stl', 'box-groups.obj', 'box-binary.stl'];
// The kit's policy (webview-kit contentSecurityPolicy) with 'self' standing in for the webview's cspSource.
const CSP = `default-src 'none'; script-src 'self'; connect-src 'self'; worker-src 'self' blob:`;

let dir = '';
let server: ReturnType<typeof createServer>;
let base = '';
let browser: any;

beforeAll(async () => {
  if (!playwright) return;
  dir = mkdtempSync(join(tmpdir(), 'mesh-web-'));
  const esbuild = new URL('../node_modules/.bin/esbuild', import.meta.url).pathname;
  const bundle = (entry: string, out: string) =>
    execFileSync(esbuild, [
      new URL(entry, import.meta.url).pathname,
      '--bundle',
      '--format=iife',
      `--outfile=${join(dir, out)}`,
      '--log-level=error',
    ]);
  bundle('../src/adapters/worker-web/worker.ts', 'worker.js');
  bundle('./browser/entry.ts', 'entry.js');
  server = createServer((req, res) => {
    const url = req.url ?? '/';
    const headers = { 'content-security-policy': CSP };
    if (url === '/')
      return void res
        .writeHead(200, { ...headers, 'content-type': 'text/html' })
        .end('<script src="/entry.js"></script>');
    const body = url.startsWith('/f/')
      ? readFileSync(new URL(url.slice(3), fixtures))
      : readFileSync(join(dir, url.slice(1)));
    res.writeHead(200, { 'content-type': 'text/javascript' }).end(body);
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  browser = await playwright.chromium.launch();
}, 60_000);

afterAll(async () => {
  await browser?.close();
  server?.close();
  if (dir) rmSync(dir, { recursive: true });
});

test.skipIf(!playwright)(
  `a pool of 2 parses fixtures in Chromium under the kit CSP, input transferred${playwright ? '' : ' (skipped: no @playwright/test, set PLAYWRIGHT_MODULE)'}`,
  async () => {
    const page = await browser.newPage();
    const violations: string[] = [];
    page.on('console', (m: { text(): string }) => violations.push(m.text()));
    await page.goto(base);
    const out = await page.evaluate(
      ([n, urls]: [number, string[]]) => (globalThis as any).run(n, urls),
      [2, names.map((n) => `/f/${n}`)],
    );
    expect(out.results).toHaveLength(4);
    for (const r of out.results) expect(r).toMatchObject({ kind: 'parsed', hasBvh: true });
    expect(out.results.every((r: { triangles: number }) => r.triangles >= 12)).toBe(true);
    expect(out.inputBytesAfterTransfer).toBe(0); // the posted buffer was detached: moved, not copied
    expect(violations.filter((m) => /Content Security Policy|Refused/i.test(m))).toEqual([]);
  },
  60_000,
);
