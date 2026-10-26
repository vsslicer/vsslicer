// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, expect, test, type Browser, type Page } from '@playwright/test';
import { build } from 'esbuild';

// three.js is a devDependency for this test only; the kit never imports it.
let browser: Browser;
let page: Page;
test.beforeAll(async () => {
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const { outputFiles } = await build({
    entryPoints: [import.meta.dirname + '/three-foreign.page.ts'],
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

type Result = Record<'three' | 'both' | 'segments' | 'threeAgain', number[]> &
  Record<'before' | 'afterCreate' | 'afterDraw', unknown[]> & { error: number };
const run = (foreign: boolean) =>
  page.evaluate((f) => (globalThis as unknown as { run: (f: boolean) => Result }).run(f), foreign);
const SIZE = 64;
const rgb = (px: number[], i: number) => px.slice(4 * i, 4 * i + 3);

test('a three.js mesh plus segments: segments above the mesh show, those under it do not', async () => {
  const r = await run(true);
  expect(r.error).toBe(0);
  const plane = rgb(r.three, 0);
  expect(plane.some((v) => v > 0)).toBe(true);
  const lit = { left: 0, right: 0 };
  const expected: number[][] = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    const right = i % SIZE >= SIZE / 2; // layer 1 (right) is above the plane, layer 0 (left) under it
    const on = rgb(r.segments, i).some((v) => v > 0);
    if (on) lit[right ? 'right' : 'left']++;
    expected.push(on && right ? rgb(r.segments, i) : plane);
  }
  const [left, right] = [lit.left, lit.right];
  expect([left > 100, right > 100]).toEqual([true, true]);
  expect(Array.from({ length: SIZE * SIZE }, (_, i) => rgb(r.both, i))).toEqual(expected);
});

test('the kit leaves three.js GL state as it was, and three.js renders the same frame after', async () => {
  const r = await run(true);
  expect(r.afterCreate).toEqual(r.before);
  expect(r.afterDraw).toEqual(r.before);
  expect(r.threeAgain).toEqual(r.three);
});

test('without foreign mode the state test sees the leak and three.js draws a wrong frame', async () => {
  const r = await run(false);
  expect(r.afterDraw).not.toEqual(r.before);
  expect(r.threeAgain).not.toEqual(r.three);
});
