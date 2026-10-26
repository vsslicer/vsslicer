// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, expect, test } from '@playwright/test';
import { build } from 'esbuild';

const MOVES = 15_000_000;
const LAYOUT_BYTES_PER_MOVE = 28; // D17 record, uploaded unchanged (README, "Move data textures")

test('15 million moves render with at most the layout bytes per move on the GPU', async () => {
  test.setTimeout(300_000);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const { outputFiles } = await build({
      entryPoints: [import.meta.dirname + '/memory.page.ts'],
      bundle: true,
      write: false,
      format: 'iife',
      platform: 'browser',
    });
    const page = await browser.newPage();
    await page.setContent('<body></body>');
    await page.addScriptTag({ content: outputFiles[0]!.text });
    const r = await page.evaluate((n) => (globalThis as unknown as { run: (n: number) => unknown }).run(n), MOVES);
    const { storageBytes, error, gpu, maxTexture } = r as {
      storageBytes: number;
      error: number;
      gpu: string;
      maxTexture: number;
    };
    const perMove = storageBytes / MOVES;
    console.log(
      `GPU bytes per move: ${perMove.toFixed(4)} (${(storageBytes / 1e6).toFixed(1)} MB for ${MOVES} moves, layout ${LAYOUT_BYTES_PER_MOVE}); ` +
        `renderer ${gpu}; max texture ${maxTexture}; Chromium ${browser.version()}; ${process.platform}/${process.arch}`,
    );
    expect(error).toBe(0);
    // Slack of 0.2 B/move: the layer table (8 B per 64-move synthetic layer = 0.125), shared records, partial rows, palette.
    expect(perMove).toBeLessThanOrEqual(LAYOUT_BYTES_PER_MOVE + 0.2);
    expect(perMove).toBeGreaterThanOrEqual(LAYOUT_BYTES_PER_MOVE); // the spy saw the data textures
  } finally {
    await browser.close();
  }
});
