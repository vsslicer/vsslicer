// SPDX-License-Identifier: AGPL-3.0-or-later
// The webview's renderer wiring against a recording fake WebGL2 context: what is uploaded, drawn and freed.
// Chunking at a 16k MAX_TEXTURE_SIZE and the shader output are webview-kit's tests (move-textures, segment-renderer specs).
import test from 'node:test';
import assert from 'node:assert';
import { createReadStream } from 'node:fs';
import { MOVE_STRIDE, MoveFlag, MoveRole } from '@vsslicer/gcode-api';
import { loadPreview } from '../src/application/load-preview.ts';
import {
  concatMoves,
  createPreviewRenderer,
  frameCamera,
  printBounds,
  visibleRange,
} from '../src/presentation/webview/preview-renderer.ts';
import { ColorMode } from '@vsslicer/webview-kit/gl';
import { spyGlUploads } from '@vsslicer/webview-kit/testing';
import { COLOR_MODES, legendFor } from '../src/presentation/webview/legend.ts';
import { presentRoles, roleName } from '../src/presentation/webview/controls.ts';
import { presetCamera } from '../src/presentation/webview/camera.ts';
import { fileURLToPath } from 'node:url';

// the corpus of load.test.ts (not imported: that would run its tests here too)
const fixture = (p: string) => fileURLToPath(new URL(`fixtures/${p}`, import.meta.url));
const FIVE_SLICERS = [
  'prusaslicer/mini_cube_ps2.8.1.gcode',
  'superslicer/superslicer-2.3.56-arcwelder.gcode',
  'orca/cube-marlin.gcode',
  'bambu-studio/cube.gcode',
  'cura/cube-cylinder-4.10.0.gcode',
];

type Call = [string, ...unknown[]];

/** Records every call; constants are distinct numbers, create* return fresh objects, compiles succeed. */
const fakeGl = (maxTextureSize: number) => {
  const calls: Call[] = [];
  const fixed: Record<string, unknown> = {
    drawingBufferWidth: 800,
    drawingBufferHeight: 600,
    getParameter: () => maxTextureSize,
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    isContextLost: () => false,
    getUniformLocation: (_: unknown, name: string) => ({ name }),
  };
  const consts = new Map<string, number>();
  const gl = new Proxy({} as Record<string, unknown>, {
    get(_, p: string) {
      if (p in fixed) return fixed[p];
      if (/^[A-Z0-9_]+$/.test(p)) return consts.get(p) ?? consts.set(p, consts.size + 1).get(p);
      return (...args: unknown[]) => {
        calls.push([p, ...args]);
        return p.startsWith('create') ? { id: calls.length } : undefined;
      };
    },
  }) as unknown as WebGL2RenderingContext;
  const count = (name: string) => calls.filter((c) => c[0] === name).length;
  const named = (name: string) => calls.filter((c) => c[0] === name);
  return { gl, calls, count, named, fixed };
};

const instances = (f: ReturnType<typeof fakeGl>) =>
  f.named('drawElementsInstanced').reduce((n, c) => n + Number(c[5]), 0);
const uniform = (f: ReturnType<typeof fakeGl>, name: string) =>
  f.named('uniform1ui').findLast((c) => (c[1] as { name: string }).name === name)?.[2];

for (const file of FIVE_SLICERS)
  test(`renders ${file}: every texture chunk uploaded and drawn, everything freed on dispose`, async () => {
    const { parsed } = await loadPreview('gcode', createReadStream(fixture(file)));
    const moves = concatMoves(parsed.moves);
    assert.strictEqual(moves.byteLength, parsed.moveCount * MOVE_STRIDE);
    // 64² texels hold 585 records, so every corpus file spans several textures
    const f = fakeGl(64);
    const canvas = new EventTarget() as HTMLCanvasElement;
    const r = createPreviewRenderer(canvas, f.gl, moves, parsed.layers, { maxTextureSize: 64 });
    const chunks = Math.ceil((parsed.moveCount - 1) / (Math.floor((64 * 64) / 7) - 1));
    assert.ok(chunks > 1);
    assert.strictEqual(f.count('createTexture'), chunks + 2, 'move textures, layer table and palette');

    r.draw({ layer: parsed.layers.length - 1, hiddenFlags: 0 });
    assert.strictEqual(f.count('drawElementsInstanced'), chunks);
    assert.strictEqual(instances(f), parsed.moveCount - 1, 'every move after record 0 is one instance');

    r.dispose();
    assert.strictEqual(f.count('deleteTexture'), f.count('createTexture'));
    assert.strictEqual(f.count('deleteProgram'), 1);
    assert.strictEqual(f.count('deleteVertexArray'), 1);
    assert.strictEqual(f.count('deleteBuffer'), 1);
  });

test('the visibility state sets the range and the masks; travels are hidden by default', async () => {
  const { parsed } = await loadPreview('gcode', createReadStream(fixture('orca/cube-marlin.gcode')));
  const f = fakeGl(16384);
  const r = createPreviewRenderer(
    new EventTarget() as HTMLCanvasElement,
    f.gl,
    concatMoves(parsed.moves),
    parsed.layers,
  );
  r.draw({ layer: 0 });
  assert.strictEqual(instances(f), parsed.layers[1]!.firstMove - 1, 'moves up to the end of layer 0');
  assert.strictEqual(uniform(f, 'uHiddenFlags'), MoveFlag.Travel);
  assert.strictEqual(uniform(f, 'uRoleMask'), 0xffffffff);
  r.draw({ layer: 0, roleMask: 1 << MoveRole.ExternalPerimeter, hiddenFlags: 0 });
  assert.strictEqual(uniform(f, 'uRoleMask'), 1 << MoveRole.ExternalPerimeter);
  assert.strictEqual(uniform(f, 'uHiddenFlags'), 0);
  r.dispose();
});

test('a context loss drops the renderer and a restore rebuilds and redraws', () => {
  const moves = new ArrayBuffer(3 * MOVE_STRIDE);
  const f = fakeGl(16384);
  const canvas = new EventTarget() as HTMLCanvasElement;
  const r = createPreviewRenderer(canvas, f.gl, moves, []);
  r.draw({ layer: 0 });
  canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  canvas.dispatchEvent(new Event('webglcontextrestored'));
  assert.strictEqual(f.count('createProgram'), 2);
  assert.strictEqual(f.count('drawElementsInstanced'), 2);
  r.dispose();
  assert.strictEqual(
    f.count('deleteProgram'),
    1,
    'only the live build is freed; the lost one is gone with its context',
  );
});

test('a restore whose rebuild throws shows the failure message instead of a blank view', () => {
  const f = fakeGl(16384);
  let shown: { dataset: Record<string, string>; textContent?: string } | undefined;
  const canvas = Object.assign(new EventTarget(), {
    ownerDocument: {
      createElement: () => {
        shown = { dataset: {} };
        return Object.assign(shown, { setAttribute() {} });
      },
    },
    replaceWith() {},
  }) as unknown as HTMLCanvasElement;
  const r = createPreviewRenderer(canvas, f.gl, new ArrayBuffer(3 * MOVE_STRIDE), []);
  f.fixed['createProgram'] = () => {
    throw new Error('driver reset');
  };
  canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  canvas.dispatchEvent(new Event('webglcontextrestored'));
  assert.strictEqual(shown?.dataset['cause'], 'restore');
  assert.match(shown?.textContent ?? '', /driver reset/);
  r.dispose();
});

test('concatMoves joins the per-chunk buffers in order', () => {
  const a = new Uint8Array(MOVE_STRIDE).fill(1).buffer;
  const b = new Uint8Array(2 * MOVE_STRIDE).fill(2).buffer;
  const out = new Uint8Array(concatMoves([a, b]));
  assert.strictEqual(out.length, 3 * MOVE_STRIDE);
  assert.deepStrictEqual([out[0], out[MOVE_STRIDE - 1], out[MOVE_STRIDE], out.at(-1)], [1, 1, 2, 2]);
  assert.strictEqual(concatMoves([a]), a, 'a single buffer is not copied');
});

test('visibleRange ends at the next layer, or at the last move', () => {
  const layers = [
    { z: 0.2, firstMove: 0 },
    { z: 0.4, firstMove: 10 },
  ];
  assert.deepStrictEqual(visibleRange(layers, 25, 0), { first: 0, count: 10 });
  assert.deepStrictEqual(visibleRange(layers, 25, 1), { first: 0, count: 25 });
});

test('the camera frames the extruded part of the print', () => {
  const v = new DataView(new ArrayBuffer(3 * MOVE_STRIDE));
  const put = (r: number, x: number, y: number, z: number, extrudes: boolean) => {
    [x, y, z].forEach((c, i) => v.setFloat32(r * MOVE_STRIDE + 4 * i, c, true));
    if (extrudes) v.setUint32(r * MOVE_STRIDE + 12, 0x3c003c00, true); // f16 1.0, 1.0
  };
  put(0, 500, 500, 50, false); // a travel far away is ignored
  put(1, 0, 0, 0, true);
  put(2, 10, 20, 2, true);
  const bounds = printBounds(v.buffer);
  assert.deepStrictEqual(bounds, [
    [0, 0, 0],
    [10, 20, 2],
  ]);
  const { view, projection } = frameCamera(bounds, 1);
  // the box centre lands on the optical axis in front of the camera, inside the clip volume
  const [x, y, z] = [5, 10, 1];
  const e = [0, 1, 2].map((i) => view[i]! * x + view[4 + i]! * y + view[8 + i]! * z + view[12 + i]!);
  assert.ok(Math.abs(e[0]!) < 1e-4 && Math.abs(e[1]!) < 1e-4 && e[2]! < 0);
  const clipZ = projection[10]! * e[2]! + projection[14]!;
  const clipW = -e[2]!;
  assert.ok(Math.abs(clipZ / clipW) < 1);
});

test('every colour mode draws the corpus; switching modes sets a uniform and uploads nothing', async () => {
  const { parsed } = await loadPreview('gcode', createReadStream(fixture('orca/cube-marlin.gcode')));
  const f = fakeGl(64);
  const spy = spyGlUploads(f.gl);
  const r = createPreviewRenderer(
    new EventTarget() as HTMLCanvasElement,
    spy.gl,
    concatMoves(parsed.moves),
    parsed.layers,
    { maxTextureSize: 64 },
  );
  const last = parsed.layers.length - 1;
  r.draw({ layer: last });
  const afterFirst = JSON.stringify(spy.uploads);
  const creates = f.count('createTexture') + f.count('createBuffer');
  for (const { mode } of COLOR_MODES) {
    const before = f.count('drawElementsInstanced');
    r.draw({ layer: last, colorMode: mode });
    assert.strictEqual(uniform(f, 'uMode'), mode);
    assert.ok(f.count('drawElementsInstanced') > before);
  }
  assert.strictEqual(JSON.stringify(spy.uploads), afterFirst, 'no upload after the first draw');
  assert.strictEqual(f.count('createTexture') + f.count('createBuffer'), creates, 'no new GPU object either');
  r.dispose();
});

test('legend data: gradients carry their range, feature and tool are categories', () => {
  const ranges = { speed: [10, 200], layerTime: [3, 40] } as const;
  assert.deepStrictEqual(legendFor(ColorMode.Speed, ranges), {
    label: 'Speed',
    kind: 'gradient',
    unit: 'mm/s',
    range: [10, 200],
  });
  assert.deepStrictEqual(legendFor(ColorMode.LayerTime, ranges).range, [3, 40]);
  assert.strictEqual(legendFor(ColorMode.Tool, ranges).kind, 'categories');
  assert.strictEqual(legendFor(ColorMode.Feature, undefined).kind, 'categories');
});

test('a saved camera is drawn instead of the fitted one', () => {
  const moves = new ArrayBuffer(3 * MOVE_STRIDE);
  const f = fakeGl(16384);
  const r = createPreviewRenderer(new EventTarget() as HTMLCanvasElement, f.gl, moves, []);
  r.draw({ layer: 0 });
  const fitted = f.named('uniformMatrix4fv').at(-2)![3] as Float32Array;
  r.draw({ layer: 0, camera: presetCamera(r.bounds, 1, 'top') });
  const top = f.named('uniformMatrix4fv').at(-2)![3] as Float32Array;
  assert.notDeepStrictEqual([...top], [...fitted]);
  r.dispose();
});

test('visibleRange: bottom layer starts the range, move cuts the top layer', () => {
  const layers = [
    { z: 0.2, firstMove: 0 },
    { z: 0.4, firstMove: 10 },
    { z: 0.6, firstMove: 20 },
  ];
  assert.deepStrictEqual(visibleRange(layers, 30, 1, undefined, 1), { first: 10, count: 10 });
  assert.deepStrictEqual(visibleRange(layers, 30, 2, 5), { first: 0, count: 25 });
  assert.deepStrictEqual(visibleRange(layers, 30, 1, 99), { first: 0, count: 20 }, 'move is clamped to the layer');
  assert.deepStrictEqual(visibleRange(layers, 30, 1, 0, 1), { first: 10, count: 0 });
});

test('role names and the roles present in the corpus', async () => {
  assert.strictEqual(roleName(MoveRole.ExternalPerimeter), 'External perimeter');
  const { parsed } = await loadPreview('gcode', createReadStream(fixture('orca/cube-marlin.gcode')));
  const roles = presentRoles(concatMoves(parsed.moves));
  assert.ok(roles.includes(MoveRole.ExternalPerimeter) && roles.length < 21);
});

test('scrubbing layers, moves and toggles over the corpus uploads nothing and narrows the draw', async () => {
  const { parsed } = await loadPreview('gcode', createReadStream(fixture('orca/cube-marlin.gcode')));
  const f = fakeGl(64);
  const spy = spyGlUploads(f.gl);
  const r = createPreviewRenderer(
    new EventTarget() as HTMLCanvasElement,
    spy.gl,
    concatMoves(parsed.moves),
    parsed.layers,
    { maxTextureSize: 64 },
  );
  const top = parsed.layers.length - 1;
  r.draw({ layer: top });
  const afterFirst = JSON.stringify(spy.uploads);
  const creates = f.count('createTexture') + f.count('createBuffer');
  const before0 = instances(f);
  r.draw({ layer: top });
  const full = instances(f) - before0;
  for (let move = 0; move < 200; move += 7) r.draw({ layer: top, move, bottom: 1, roleMask: 0b110, hiddenFlags: 0 });
  const b = instances(f);
  r.draw({ layer: top, move: 3 });
  assert.ok(instances(f) - b < full, 'a short move range draws fewer instances');
  assert.strictEqual(JSON.stringify(spy.uploads), afterFirst, 'no upload while scrubbing');
  assert.strictEqual(f.count('createTexture') + f.count('createBuffer'), creates);
  r.dispose();
});
