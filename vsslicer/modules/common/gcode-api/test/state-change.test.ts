// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import {
  STATE_CHANGE_STRIDE,
  StateChangeOffset,
  StateKind,
  readStateChange,
  writeStateChange,
  type StateChange,
} from '../src/index.ts';

test('a state change is 12 aligned bytes', () => {
  expect(STATE_CHANGE_STRIDE).toBe(12);
  expect(StateChangeOffset).toEqual({ moveIndex: 0, value: 4, kind: 8, index: 9 });
});

test('kinds are distinct u8 values', () => {
  const values = Object.values(StateKind);
  expect(new Set(values).size).toBe(values.length);
  expect(Math.max(...values)).toBeLessThan(256);
});

test('a state change round-trips through the buffer', () => {
  const change: StateChange = { moveIndex: 0xfffffffe, kind: StateKind.MaxAccel, index: 3, value: 5000.5 };
  const view = new DataView(new Uint8Array(2 * STATE_CHANGE_STRIDE).fill(0xff).buffer);
  writeStateChange(view, 1, change);
  expect(readStateChange(view, 1)).toEqual(change);
  expect(view.getUint16(STATE_CHANGE_STRIDE + 10, true)).toBe(0); // padding cleared
});
