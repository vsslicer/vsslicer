// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from '@playwright/test';
import { build } from 'esbuild';

// Chromium started without WebGL: the kit shows its failure message instead of a blank canvas.
test('WebGL disabled shows the failure message with its cause', async ({ browser }) => {
  const { outputFiles } = await build({
    stdin: {
      contents: `import { createGl2Context, showGlFailure } from './src/gl/index.ts';
        const canvas = document.querySelector('canvas')!;
        const r = createGl2Context(canvas);
        if (!r.ok) showGlFailure(canvas, r.error);`,
      resolveDir: import.meta.dirname + '/..',
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent('<canvas></canvas>');
  await page.addScriptTag({ content: outputFiles[0]!.text });
  const alert = page.getByRole('alert');
  await expect(alert).toHaveAttribute('data-cause', /^(no-webgl2|creation-refused)$/);
  await expect(alert).toContainText('argv.json');
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
  await context.close();
});
