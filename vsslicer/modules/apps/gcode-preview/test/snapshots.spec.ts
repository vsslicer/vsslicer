// SPDX-License-Identifier: AGPL-3.0-or-later
import { createReadStream } from 'node:fs';
import { chromium, expect, test, type Browser, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { ColorMode } from '@vsslicer/webview-kit/gl';
import { MoveFlag, type Layer } from '@vsslicer/gcode-api';
import { loadPreview } from '../src/application/load-preview.ts';
import type { Visibility } from '../src/presentation/webview/preview-renderer.ts';

// Pixel oracle for the preview's own render path: a real Bambu Studio and a real PrusaSlicer file, parsed and
// planned by loadPreview, drawn by the webview's preview renderer on SwiftShader (software GL, so the PNGs match
// across machines). Only the canvas is captured. Refresh after an intended change: pnpm test:browser --update-snapshots
const FILES = {
  bambu: 'fixtures/bambu-studio/cube.gcode',
  prusa: 'fixtures/prusaslicer/mini_cube_ps2.8.1.gcode',
} as const;

const loaded: Record<string, { base64: string; layers: Layer[] }> = {};
let browser: Browser;
let page: Page;
test.beforeAll(async () => {
  for (const [name, file] of Object.entries(FILES)) {
    const { parsed } = await loadPreview('gcode', createReadStream(`${__dirname}/${file}`));
    loaded[name] = {
      base64: Buffer.concat(parsed.moves.map((b) => new Uint8Array(b))).toString('base64'),
      layers: parsed.layers,
    };
  }
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const { outputFiles } = await build({
    entryPoints: [__dirname + '/snapshots.page.ts'],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
  });
  page = await browser.newPage({ viewport: { width: 480, height: 360 } });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent(
    '<body style="margin:0;background:#1e1e1e"><canvas width="480" height="360" style="display:block"></canvas></body>',
  );
  await page.addScriptTag({ content: outputFiles[0]!.text });
  expect(errors).toEqual([]);
});
test.afterAll(() => browser.close());

const shots: [string, Omit<Visibility, 'layer'> & { layer?: number }][] = [
  ['feature', { colorMode: ColorMode.Feature, hiddenFlags: 0 }],
  ['speed', { colorMode: ColorMode.Speed, hiddenFlags: 0 }],
  ['layer-range', { colorMode: ColorMode.Feature, bottom: 10, layer: 30 }],
  ['travel-hidden', { colorMode: ColorMode.Feature, hiddenFlags: MoveFlag.Travel }],
];
for (const name of Object.keys(FILES))
  for (const [shot, view] of shots)
    test(`${name} ${shot}`, async () => {
      await page.evaluate(
        ([d, v]) => (globalThis as unknown as { show: (...a: unknown[]) => void }).show(d.base64, d.layers, v),
        [loaded[name]!, { ...view, layer: view.layer ?? loaded[name]!.layers.length - 1 }] as const,
      );
      await expect(page.locator('canvas')).toHaveScreenshot(`${name}-${shot}.png`, {
        threshold: 0.1,
        maxDiffPixelRatio: 0.0005,
      });
    });
