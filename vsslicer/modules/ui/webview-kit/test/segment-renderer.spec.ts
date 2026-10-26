// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, expect, test, type Browser, type Page } from '@playwright/test';
import { build } from 'esbuild';

// The config starts Chromium without WebGL for gl.spec.ts; these tests need SwiftShader WebGL2.
let browser: Browser;
let page: Page;
test.beforeAll(async () => {
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const { outputFiles } = await build({
    entryPoints: [import.meta.dirname + '/segment-renderer.page.ts'],
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

type Px = [number, number, number];
type Result = {
  px: number[];
  left: Px;
  right: Px;
  ranges: {
    speed: number[];
    layerTime: number[];
    width: number[];
    flow: number[];
    fan: number[];
    temperature: number[];
  };
  error: number;
};
const render = (o: object = {}) =>
  page.evaluate((o) => (globalThis as unknown as { render: (o: object) => Result }).render(o), o);
const [FEATURE, SPEED, TOOL, LAYER_TIME] = [0, 1, 2, 3];
const [WIDTH, FLOW, FAN, TEMPERATURE] = [4, 5, 6, 7];
const LAYER1 = 17; // first record of layer 1 (the right half)
const lit = (p: Px) => p.some((v) => v > 0);

test('draws the move set at two visible ranges', async () => {
  const all = await render();
  const layer0 = await render({ first: 1, count: LAYER1 - 1 });
  expect([all.error, layer0.error]).toEqual([0, 0]);
  expect([lit(all.left), lit(all.right)]).toEqual([true, true]);
  expect([lit(layer0.left), lit(layer0.right)]).toEqual([true, false]);
  // A range ending at record k draws exactly what the buffer cut after record k draws.
  expect(layer0.px).toEqual((await render({ records: LAYER1 })).px);
});

test('a range across many small textures draws as one texture does, in every mode', async () => {
  test.setTimeout(60_000);
  for (const colorMode of [FEATURE, SPEED, TOOL, LAYER_TIME, WIDTH, FLOW, FAN, TEMPERATURE]) {
    const range = { first: 5, count: 20, colorMode, states: true };
    const one = await render(range);
    const many = await render({ ...range, maxTextureSize: 4 }); // 2 records, so 1 segment, per texture
    expect(one.px.some((v, i) => i % 4 !== 3 && v > 0)).toBe(true);
    expect(many.px).toEqual(one.px);
  }
});

test('role and flag masks hide moves', async () => {
  const noExternal = await render({ roleMask: ~(1 << 2) });
  const noArcs = await render({ hiddenFlags: 16 });
  const noPerimeter = await render({ roleMask: ~(1 << 1) });
  expect([lit(noExternal.left), lit(noExternal.right)]).toEqual([true, false]);
  expect([lit(noArcs.left), lit(noArcs.right)]).toEqual([true, false]);
  expect([lit(noPerimeter.left), lit(noPerimeter.right)]).toEqual([false, true]);
});

test('colour modes feature, speed, tool and layer time are chosen by uniform', async () => {
  const feature = await render({ colorMode: FEATURE });
  const speed = await render({ colorMode: SPEED });
  const tool = await render({ colorMode: TOOL });
  const layerTime = await render({ colorMode: LAYER_TIME });
  for (const r of [feature, speed, tool, layerTime]) expect(r.error).toBe(0);
  // Perimeter yellow (255,230,77) left, external perimeter orange (255,125,56) right.
  expect(feature.left[1]).toBeGreaterThan(feature.right[1] + 40);
  // Tool 0 orange, tool 1 blue.
  expect(tool.left[0]).toBeGreaterThan(tool.left[2]);
  expect(tool.right[2]).toBeGreaterThan(tool.right[0]);
  // Speed: 28 mm/s left is the low end (blue), 280 mm/s right the high end (red).
  expect(speed.ranges.speed[0]).toBeCloseTo(28, 3);
  expect(speed.ranges.speed[1]).toBeCloseTo(280, 2);
  expect(speed.left[2]).toBeGreaterThan(speed.left[0]);
  expect(speed.right[0]).toBeGreaterThan(speed.right[2]);
  // Layer time: layer 0 (left, 8.08 s) is the high end, layer 1 (right, 0.88 s) the low end.
  expect(layerTime.ranges.layerTime[0]).toBeCloseTo(0.88, 4);
  expect(layerTime.ranges.layerTime[1]).toBeCloseTo(8.08, 4);
  expect(layerTime.left[0]).toBeGreaterThan(layerTime.left[2]);
  expect(layerTime.right[2]).toBeGreaterThan(layerTime.right[0]);
  // A wider colour range maps both speeds to the low end.
  const wide = await render({ colorMode: SPEED, colorRange: [0, 1e4] });
  expect(wide.right[2]).toBeGreaterThan(wide.right[0]);
});

test('width and flow modes colour by the data range, which is exposed for a legend', async () => {
  const width = await render({ colorMode: WIDTH, colorRange: [0, 6] });
  const flow = await render({ colorMode: FLOW });
  expect([width.error, flow.error]).toEqual([0, 0]);
  expect(width.ranges.width).toEqual([3, 3]);
  expect(width.ranges.flow[0]).toBeCloseTo(16.8, 2); // left: 28 mm/s * 3 mm * 0.2 mm
  expect(width.ranges.flow[1]).toBeCloseTo(168, 1); // right: 280 mm/s
  // Width 3 is mid-range of [0, 6]: neither end colour.
  expect(width.left).toEqual(width.right);
  expect(width.left[0]).toBeGreaterThan(width.left[2] + 100); // yellow-green mid stop: not blue
  expect(width.left[1]).toBeGreaterThan(width.left[2] + 100);
  // Flow: left the low end (blue), right the high end (red).
  expect(flow.left[2]).toBeGreaterThan(flow.left[0]);
  expect(flow.right[0]).toBeGreaterThan(flow.right[2]);
});

test('fan and temperature modes colour by the folded state changes, exposed for a legend', async () => {
  test.setTimeout(60_000);
  const fan = await render({ colorMode: FAN, states: true });
  const temperature = await render({ colorMode: TEMPERATURE, states: true });
  expect([fan.error, temperature.error]).toEqual([0, 0]);
  expect(fan.ranges.fan).toEqual([0, 100]);
  expect(fan.ranges.temperature).toEqual([200, 250]);
  // Left: fan 0 and 200 C, the low end (blue); right: 100% and 250 C (tool 1), the high end (red).
  for (const r of [fan, temperature]) {
    expect(r.left[2]).toBeGreaterThan(r.left[0]);
    expect(r.right[0]).toBeGreaterThan(r.right[2]);
  }
  // Without state changes both modes draw every move as unknown: the flat grey of DUMMY_COLOR.
  const unknown = await render({ colorMode: FAN });
  expect(unknown.ranges.fan).toEqual([0, 0]);
  expect(unknown.left[0]).toBe(unknown.left[2]);
  expect(unknown.left[0]).toBe(unknown.left[1]);
});
