// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, expect, test, type Browser, type Page } from '@playwright/test';
import { build } from 'esbuild';

// Pixel oracle for the segment shader: each colour mode, a layer range and a travel toggle, compared with
// the PNGs in test/__snapshots__ (SwiftShader is software rendering, so they match across machines).
// Refresh after an intended shader change: pnpm test:browser --update-snapshots
let browser: Browser;
let page: Page;
test.beforeAll(async () => {
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const { outputFiles } = await build({
    entryPoints: [import.meta.dirname + '/renderer-snapshots.page.ts'],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
  });
  page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent('<body style="margin:0"></body>');
  await page.addScriptTag({ content: outputFiles[0]!.text });
  expect(errors).toEqual([]);
});
test.afterAll(() => browser.close());

const TRAVEL = 1;
const shots: [string, object][] = [
  ['feature', { colorMode: 0 }],
  ['speed', { colorMode: 1 }],
  ['tool', { colorMode: 2 }],
  ['layer-time', { colorMode: 3 }],
  ['width', { colorMode: 4 }],
  ['flow', { colorMode: 5 }],
  ['layer-range', { colorMode: 0, layers: [1, 3] }],
  ['travel-hidden', { colorMode: 0, hiddenFlags: TRAVEL }],
];
for (const [name, view] of shots) {
  test(`snapshot ${name}`, async () => {
    await page.evaluate((v: { layers?: number[] } & object) => {
      const g = globalThis as unknown as { render: (o: object) => void; layerStarts: number[] };
      const { layers, ...rest } = v;
      const range = layers
        ? { first: g.layerStarts[layers[0]!]!, count: g.layerStarts[layers[1]!]! - g.layerStarts[layers[0]!]! }
        : {};
      g.render({ ...rest, ...range });
    }, view);
    await expect(page.locator('canvas')).toHaveScreenshot(`${name}.png`, { threshold: 0.1, maxDiffPixelRatio: 0.0005 });
  });
}
