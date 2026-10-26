// SPDX-License-Identifier: AGPL-3.0-or-later
// The slider and toggle rules behind the webview's handlers, in plain Node.
import test from 'node:test';
import assert from 'node:assert';
import { MoveFlag, MoveRole } from '@vsslicer/gcode-api';
import { nextView, type ViewRules } from '../src/presentation/webview/controls.ts';

const v = (p: Partial<ViewRules> = {}): ViewRules => ({ layer: 10, ...p });

test('top layer: resets the move count and clamps the bottom to it', () => {
  assert.deepStrictEqual(nextView(v({ move: 5, bottom: 8 }), { kind: 'top', value: 6 }), {
    layer: 6,
    move: undefined,
    bottom: 6,
  });
  assert.strictEqual(nextView(v({ bottom: 2 }), { kind: 'top', value: 6 }).bottom, 2, 'a lower bottom stays');
  assert.strictEqual(nextView(v(), { kind: 'top', value: 6 }).bottom, 0, 'no bottom means 0');
});

test('bottom layer: pushes the top up and keeps the move count only when the top did not change', () => {
  assert.deepStrictEqual(nextView(v({ move: 5 }), { kind: 'bottom', value: 4 }), { layer: 10, bottom: 4, move: 5 });
  assert.deepStrictEqual(nextView(v({ move: 5 }), { kind: 'bottom', value: 12 }), {
    layer: 12,
    bottom: 12,
    move: undefined,
  });
  assert.strictEqual(nextView(v({ layer: null }), { kind: 'bottom', value: 3 }).layer, 3);
});

test('move slider: the maximum means all moves (undefined)', () => {
  assert.strictEqual(nextView(v(), { kind: 'move', value: 7, max: 9 }).move, 7);
  assert.strictEqual(nextView(v({ move: 3 }), { kind: 'move', value: 9, max: 9 }).move, undefined);
});

test('role toggle: XOR on the mask, unsigned, and a second click restores it', () => {
  const off = nextView(v(), { kind: 'role', value: MoveRole.ExternalPerimeter });
  assert.strictEqual(off.roleMask, (0xffffffff ^ (1 << MoveRole.ExternalPerimeter)) >>> 0);
  assert.strictEqual(nextView(off, { kind: 'role', value: MoveRole.ExternalPerimeter }).roleMask, 0xffffffff);
  assert.ok(nextView(v(), { kind: 'role', value: 31 }).roleMask! > 0, 'bit 31 does not go negative');
});

test('travel toggle flips the hidden flag; the default hides travels', () => {
  const shown = nextView(v(), { kind: 'travel' });
  assert.strictEqual(shown.hiddenFlags! & MoveFlag.Travel, 0);
  assert.strictEqual(nextView(shown, { kind: 'travel' }).hiddenFlags! & MoveFlag.Travel, MoveFlag.Travel);
});

test('play overwrites layer and move, and keeps the bottom at or below the layer', () => {
  assert.deepStrictEqual(nextView(v({ bottom: 8, move: 1 }), { kind: 'play', layer: 3, move: 40 }), {
    layer: 3,
    move: 40,
    bottom: 3,
  });
  assert.strictEqual(nextView(v({ bottom: 2 }), { kind: 'play', layer: 3, move: 0 }).bottom, 2);
});

test('load keeps a saved view and shows the whole print (top layer) on a fresh one', () => {
  const saved = v({ layer: 3, bottom: 1, roleMask: 5 });
  assert.deepStrictEqual(nextView(saved, { kind: 'load', layerCount: 50 }), saved);
  assert.strictEqual(nextView(v({ layer: null }), { kind: 'load', layerCount: 50 }).layer, 49);
  assert.strictEqual(nextView(undefined, { kind: 'load', layerCount: 0 }).layer, 0);
});
