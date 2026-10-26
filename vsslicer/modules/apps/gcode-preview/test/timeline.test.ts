// SPDX-License-Identifier: AGPL-3.0-or-later
import test from 'node:test';
import assert from 'node:assert';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MOVE_STRIDE } from '@vsslicer/gcode-api';
import { spyGlUploads } from '@vsslicer/webview-kit/testing';
import { loadPreview } from '../src/application/load-preview.ts';
import { concatMoves, createPreviewRenderer } from '../src/presentation/webview/preview-renderer.ts';
import {
  createClock,
  layerOfMove,
  moveAtTime,
  positionAt,
  project,
  stepTime,
} from '../src/presentation/webview/timeline.ts';
import { cameraMatrices, presetCamera } from '../src/presentation/webview/camera.ts';

// Three moves ending at x = 10, 20, 20 (the last is a z hop), starting at 0 s, 2 s and 4 s; the print ends at 6 s.
const buffer = () => {
  const b = new ArrayBuffer(3 * MOVE_STRIDE);
  const v = new DataView(b);
  [
    [10, 0, 0, 0],
    [20, 0, 0, 2],
    [20, 0, 5, 4],
  ].forEach(([x, y, z, t], i) => {
    v.setFloat32(i * MOVE_STRIDE, x!, true);
    v.setFloat32(i * MOVE_STRIDE + 4, y!, true);
    v.setFloat32(i * MOVE_STRIDE + 8, z!, true);
    v.setFloat32(i * MOVE_STRIDE + 24, t!, true);
  });
  return b;
};

test('the clock plays at the speed multiplier, pauses, stops at the end and restarts from there', () => {
  const c = createClock(10);
  c.tick(1);
  assert.strictEqual(c.state.time, 0, 'paused clocks do not advance');
  c.play();
  c.setSpeed(4);
  c.tick(1);
  assert.strictEqual(c.state.time, 4);
  c.pause();
  c.tick(1);
  assert.strictEqual(c.state.time, 4);
  c.setSpeed(-1);
  assert.strictEqual(c.state.speed, 4, 'a bad speed is ignored');
  c.play();
  c.tick(5);
  assert.deepStrictEqual(c.state, { time: 10, speed: 4, playing: false });
  c.play();
  assert.deepStrictEqual([c.state.time, c.state.playing], [0, true]);
  c.seek(99);
  assert.strictEqual(c.state.time, 10);
});

test('moves are found by start time and the marker interpolates over a move', () => {
  const b = buffer();
  assert.deepStrictEqual(
    [-1, 0, 1.9, 2, 5].map((t) => moveAtTime(b, t)),
    [0, 0, 0, 1, 2],
  );
  const p = [0, 0, 0];
  assert.strictEqual(positionAt(b, 3, 6, p), 1);
  assert.deepStrictEqual(p, [15, 0, 0], 'halfway through move 1');
  positionAt(b, 0, 6, p);
  assert.deepStrictEqual(p, [10, 0, 0], 'the first move has no earlier point');
  assert.strictEqual(positionAt(b, 5, 6, p), 2);
  assert.deepStrictEqual(p, [20, 0, 2.5], 'halfway through the last move, which runs to the end of the print');
});

test('step goes to the next and previous start time', () => {
  const b = buffer();
  assert.strictEqual(stepTime(b, 0, 1, 6), 2);
  assert.strictEqual(stepTime(b, 4, 1, 6), 6, 'past the last start: the end');
  assert.strictEqual(stepTime(b, 4, -1, 6), 2);
  assert.strictEqual(stepTime(b, 5, -1, 6), 4);
  assert.strictEqual(stepTime(b, 0, -1, 6), 0);
});

test('layerOfMove counts the moves done in the layer', () => {
  const layers = [{ firstMove: 2 }, { firstMove: 5 }] as never[];
  assert.deepStrictEqual(layerOfMove(layers, 0), { layer: 0, move: 0 });
  assert.deepStrictEqual(layerOfMove(layers, 2), { layer: 0, move: 1 });
  assert.deepStrictEqual(layerOfMove(layers, 5), { layer: 1, move: 1 });
});

test('project puts the camera target in the middle of the canvas', () => {
  const cam = presetCamera(
    [
      [0, 0, 0],
      [10, 10, 10],
    ],
    1,
  );
  const { view, projection } = cameraMatrices(cam, 1);
  const p = project(view, projection, cam.target)!;
  assert.ok(Math.abs(p[0] - 0.5) < 1e-5 && Math.abs(p[1] - 0.5) < 1e-5);
});

test('playing the corpus advances the visibility range monotonically and uploads nothing', async () => {
  const { parsed, timing } = await loadPreview(
    'gcode',
    createReadStream(fileURLToPath(new URL('fixtures/orca/cube-marlin.gcode', import.meta.url))),
  );
  const moves = concatMoves(parsed.moves);
  const gl = new Proxy({} as Record<string, unknown>, {
    get: (_, p: string) =>
      p === 'getParameter'
        ? () => 64
        : p === 'isContextLost'
          ? () => false
          : p === 'drawingBufferWidth' || p === 'drawingBufferHeight'
            ? 100
            : /^[A-Z0-9_]+$/.test(p)
              ? 1
              : p.startsWith('create') || p === 'getUniformLocation'
                ? () => ({})
                : p.startsWith('get')
                  ? () => true
                  : () => undefined,
  }) as unknown as WebGL2RenderingContext;
  const spy = spyGlUploads(gl);
  const r = createPreviewRenderer(new EventTarget() as HTMLCanvasElement, spy.gl, moves, parsed.layers, {
    maxTextureSize: 64,
  });
  r.draw({ layer: 0 });
  const uploaded = JSON.stringify(spy.uploads);
  const clock = createClock(timing.totalTime);
  clock.play();
  clock.setSpeed(timing.totalTime / 50);
  let last = -1;
  while (clock.state.playing) {
    clock.tick(1);
    const i = positionAt(moves, clock.state.time, timing.totalTime);
    assert.ok(i >= last, 'the move index never goes back');
    last = i;
    r.draw(layerOfMove(parsed.layers, i));
  }
  assert.ok(last > parsed.moveCount / 2);
  assert.strictEqual(JSON.stringify(spy.uploads), uploaded, 'scrubbing uploads nothing');
  r.dispose();
});
