// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, expect, test, type Browser, type Page } from '@playwright/test';
import { build } from 'esbuild';

// The config starts Chromium without WebGL for gl.spec.ts; these tests need SwiftShader WebGL2.
let browser: Browser;
let page: Page;
test.beforeAll(async () => {
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const { outputFiles } = await build({
    entryPoints: [import.meta.dirname + '/move-textures.page.ts'],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
  });
  page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent('<body></body>');
  await page.addScriptTag({ content: outputFiles[0]!.text });
  expect(errors).toEqual([]);
});
test.afterAll(() => browser.close());

type Check = { chunks: number; green: number; red: number; error: number };
type Render = { chunks: number; atUpload: number; afterViews: number; px: number[]; error: number };
const check = (count: number, limit?: number) =>
  page.evaluate(
    ([c, l]) => (globalThis as unknown as { check: (c: number, l?: number) => Check }).check(c!, l),
    [count, limit],
  );
const render = (count: number, limit?: number) =>
  page.evaluate(
    ([c, l]) => (globalThis as unknown as { render: (c: number, l?: number) => Render }).render(c!, l),
    [count, limit],
  );

const COUNT = 1000; // above 8² = 64 records, so limit 8 needs many textures

test('the GLSL accessors decode every field of every record, across chunks', async () => {
  for (const limit of [undefined, 8]) {
    const r = await check(COUNT, limit);
    expect(r).toMatchObject({ green: COUNT, red: 0, error: 0 });
    if (limit) expect(r.chunks).toBeGreaterThan(1);
  }
});

test('moves above MAX_TEXTURE_SIZE² render identically to one texture; views never upload', async () => {
  const one = await render(COUNT);
  const many = await render(COUNT, 8);
  expect([one.chunks, many.chunks, one.error, many.error]).toEqual([1, Math.ceil((COUNT - 1) / 8), 0, 0]);
  expect(one.px.some((v, i) => i % 4 !== 3 && v > 0)).toBe(true);
  expect(many.px).toEqual(one.px);
  // At most two texSubImage2D per chunk (full rows, then the partial last row), none after.
  expect(many.atUpload).toBeLessThanOrEqual(2 * many.chunks);
  expect(many.afterViews).toBe(many.atUpload);
  expect(one.afterViews).toBe(one.atUpload);
});
