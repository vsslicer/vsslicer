// SPDX-License-Identifier: AGPL-3.0-or-later
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { startWebviewHost, type WebviewHost } from '../src/index.ts';

const bundle = join(
  dirname(createRequire(import.meta.url).resolve('@vsslicer/example-extension/package.json')),
  'dist/webview.js',
);
let host: WebviewHost;
test.beforeAll(async () => {
  host = await startWebviewHost(bundle);
});
test.afterAll(() => host.close());

test('the example-extension webview bundle loads under the stub and posts ready', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(host.url);
  await expect(page.locator('#title')).toHaveText('VSSlicer sample webview');
  expect(
    await page.evaluate(() => (window as unknown as { __vscode: { messages: unknown[] } }).__vscode.messages),
  ).toEqual([{ type: 'ready' }]);
  expect(errors).toEqual([]);
});
