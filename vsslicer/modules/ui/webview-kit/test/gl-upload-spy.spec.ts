// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, expect, test, type Browser, type Page } from '@playwright/test';
import { build } from 'esbuild';

let browser: Browser;
let page: Page;
test.beforeAll(async () => {
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const { outputFiles } = await build({
    entryPoints: [import.meta.dirname + '/gl-upload-spy.page.ts'],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
  });
  page = await browser.newPage();
  await page.setContent('<body></body>');
  await page.addScriptTag({ content: outputFiles[0]!.text });
});
test.afterAll(() => browser.close());

test('colour mode and range changes upload nothing', async () => {
  const r = await page.evaluate(() => (globalThis as unknown as { run: () => unknown }).run());
  const { atCreate, afterCreate, draws, error } = r as {
    atCreate: Record<string, number>;
    afterCreate: Record<string, number>;
    draws: number;
    error: number;
  };
  // The spy sees the construction uploads, so an empty result after it is not a blind spy.
  expect(atCreate.texSubImage2D).toBeGreaterThan(0);
  expect(atCreate.bufferData).toBeGreaterThan(0);
  expect(draws).toBe(8 * 21); // all eight colour modes (fan and temperature included), 21 ranges each
  expect(afterCreate).toEqual({});
  expect(error).toBe(0);
});
