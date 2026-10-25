// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { trianglePage, webglRenderer } from '../src/index.ts';

// Tolerance: SwiftShader is deterministic on one image, but Chromium/driver patch bumps may shift
// anti-aliased edge pixels. Allow 0.2% of the 256x256 canvas (about 130 pixels) to differ, where a pixel
// differs when its YIQ colour distance exceeds Playwright's `threshold` of 0.1 (the default is 0.2).
const tolerance = { maxDiffPixelRatio: 0.002, threshold: 0.1 };

test('WebGL runs on SwiftShader', async ({ page }) => {
  await page.setContent('<canvas></canvas>');
  expect(await webglRenderer(page)).toMatch(/SwiftShader/i);
});

test('WebGL2 triangle matches the snapshot', async ({ page }, testInfo) => {
  test.skip(
    process.platform !== 'linux' && !existsSync(testInfo.snapshotPath('triangle.png')),
    `no ${process.platform} baseline (only linux baselines are committed); run in the Playwright Linux image, see README`,
  );
  await page.setContent(trianglePage('1e90ff'));
  await expect(page).toHaveTitle('drawn');
  expect(await webglRenderer(page)).toMatch(/SwiftShader/i);
  await expect(page.locator('#c')).toHaveScreenshot('triangle.png', tolerance);
});
