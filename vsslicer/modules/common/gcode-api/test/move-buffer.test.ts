// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole, readMove, writeMove, type Move } from '../src/index.ts';

// [size in bytes, element size in bytes] per field
const fields: Record<keyof typeof MoveOffset, [number, number]> = {
  position: [12, 4],
  width: [2, 2],
  height: [2, 2],
  role: [1, 1],
  tool: [1, 1],
  flags: [1, 1],
  fileOffset: [4, 4],
  startTime: [4, 4],
};

test('a move is 28 bytes', () => {
  expect(MOVE_STRIDE).toBe(28);
  const used = Object.values(fields).reduce((sum, [size]) => sum + size, 0);
  expect(MOVE_STRIDE - used).toBe(1); // the one padding byte after flags
});

test('fields are aligned for vertexAttribPointer and do not overlap', () => {
  expect(MOVE_STRIDE % 4).toBe(0);
  const spans = Object.entries(fields)
    .map(([name, [size, element]]) => {
      const offset = MoveOffset[name as keyof typeof MoveOffset];
      expect(offset % element, name).toBe(0);
      return [offset, offset + size] as const;
    })
    .sort((a, b) => a[0] - b[0]);
  spans.forEach(([start], i) => expect(start).toBeGreaterThanOrEqual(i ? spans[i - 1]![1] : 0));
  expect(spans.at(-1)![1]).toBeLessThanOrEqual(MOVE_STRIDE);
});

test('a move round-trips through the buffer', () => {
  const move: Move = {
    x: 110.5, y: -3.25, z: 0.25, width: 0.4501953125, height: 0.199951171875,
    role: MoveRole.ExternalPerimeter, tool: 3, flags: MoveFlag.Arc | MoveFlag.Wipe,
    fileOffset: 0xfffffffe, startTime: 43200.5,
  };
  const view = new DataView(new ArrayBuffer(2 * MOVE_STRIDE));
  writeMove(view, 1, move);
  expect(readMove(view, 1)).toEqual(move);
  expect(new Uint8Array(view.buffer, 0, MOVE_STRIDE).every((b) => b === 0)).toBe(true);
});
