// SPDX-License-Identifier: AGPL-3.0-or-later
// GCP-51/52: offsets, layers and percents mapped to moves, on a hand-made track and on the .gcode.3mf corpus.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MOVE_STRIDE, MoveOffset, MoveRole, writeMove } from '@vsslicer/gcode-api';
import { resolvePosition } from '../src/domain/print-position.ts';
import { loadPlate } from '../src/application/load-3mf.ts';

const fixture = (p: string) => fileURLToPath(new URL(`fixtures/${p}`, import.meta.url));

/** 10 moves, move i at offset 100*i + 7 (so offsets can fall inside a line), layers starting at moves 0, 4 and 8. */
const track = () => {
  const b = new ArrayBuffer(10 * MOVE_STRIDE);
  const v = new DataView(b);
  for (let i = 0; i < 10; i++)
    writeMove(v, i, {
      x: 0,
      y: 0,
      z: 0,
      width: 0,
      height: 0,
      role: MoveRole.Unknown,
      tool: 0,
      flags: 0,
      fileOffset: 100 * i + 7,
      startTime: i,
    });
  const layers = [0, 4, 8].map((firstMove, i) => ({ z: 0.2 * (i + 1), firstMove }));
  return { moves: [b], moveCount: 10, layers, totalTime: 10 };
};

test('an offset inside a line maps to the move whose line holds it', () => {
  const t = track();
  assert.strictEqual(resolvePosition(t, { fileOffset: 350 }).move, 3); // inside move 3's line (307..406)
  assert.strictEqual(resolvePosition(t, { fileOffset: 406 }).move, 3); // its last byte
  assert.strictEqual(resolvePosition(t, { fileOffset: 3 }).move, 0); // before the first move
  assert.strictEqual(resolvePosition(t, { fileOffset: 350 }).warning, undefined);
});

test('an offset on a layer boundary maps to that layer first move, one byte before to the last of the layer before', () => {
  const t = track();
  assert.strictEqual(resolvePosition(t, { fileOffset: 407 }).move, 4);
  assert.strictEqual(resolvePosition(t, { fileOffset: 406 }).move, 3);
  assert.strictEqual(resolvePosition(t, { layer: 2 }).move, 4);
  assert.strictEqual(resolvePosition(t, { layer: 3 }).move, 8);
});

test('an offset past the end is clamped to the last move with a warning', () => {
  const t = track();
  assert.strictEqual(resolvePosition(t, { fileOffset: 907 }).warning, undefined); // exactly the last move
  const r = resolvePosition(t, { fileOffset: 5000 });
  assert.strictEqual(r.move, 9);
  assert.match(r.warning ?? '', /past the last move/);
});

test('layer and percent positions on a .gcode.3mf (no file offset)', async () => {
  const l = await loadPlate(readFileSync(fixture('bambu-studio/h2c-cube.gcode.3mf')), undefined);
  const { parsed, timing } = l;
  const t = { ...parsed, totalTime: timing.totalTime };
  assert.ok(parsed.layers.length > 2);
  for (const n of [1, 2, parsed.layers.length])
    assert.deepStrictEqual(resolvePosition(t, { layer: n }), { by: 'layer', move: parsed.layers[n - 1]!.firstMove });
  assert.throws(() => resolvePosition(t, { layer: parsed.layers.length + 1 }), RangeError);
  const startOf = (i: number) => {
    const v = new DataView(parsed.moves[0]!);
    return v.getFloat32(i * MOVE_STRIDE + MoveOffset.startTime, true);
  };
  assert.strictEqual(resolvePosition(t, { percent: 0 }).move, 0);
  assert.strictEqual(resolvePosition(t, { percent: 100 }).move, parsed.moveCount - 1);
  const r = resolvePosition(t, { percent: 50 });
  assert.ok(startOf(r.move) <= 0.5 * timing.totalTime);
  assert.ok(r.move + 1 >= parsed.moveCount || startOf(r.move + 1) > 0.5 * timing.totalTime);
});
