// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, expect, test } from '@playwright/test';
import { build } from 'esbuild';

test('loseContext then restoreContext redraws the same image with no host message', async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const { outputFiles } = await build({
      entryPoints: [import.meta.dirname + '/context-loss.page.ts'],
      bundle: true,
      write: false,
      format: 'iife',
      platform: 'browser',
    });
    const page = await browser.newPage();
    await page.setContent('<body></body>');
    await page.addScriptTag({ content: outputFiles[0]!.text });
    const r = await page.evaluate(() => (globalThis as unknown as { run: () => Promise<never> }).run());
    const { before, after, isLost, sent, error } = r as {
      before: number[];
      after: number[];
      isLost: boolean;
      sent: number;
      error: number;
    };
    expect(isLost).toBe(true);
    expect(before.some((v, i) => i % 4 !== 3 && v > 0)).toBe(true);
    expect(after).toEqual(before);
    expect(sent).toBe(0);
    expect(error).toBe(0);
  } finally {
    await browser.close();
  }
});
