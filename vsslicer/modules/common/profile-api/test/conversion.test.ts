// SPDX-License-Identifier: AGPL-3.0-or-later
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { ConversionError, fromNative, toNative, type Conversion } from '../src/index.ts';

const rt = (c: Conversion | undefined, n: Parameters<typeof fromNative>[1]) =>
  toNative(c, fromNative(c, n).value).value;
const code = (f: () => unknown) => {
  try {
    f();
  } catch (e) {
    return (e as ConversionError).code;
  }
};

describe('scale', () => {
  const angle: Conversion = { kind: 'scale', factor: -1, offset: 90 };
  const flow: Conversion = { kind: 'scale', factor: 0.01 };
  test('90-x and flow percent', () => {
    expect(fromNative(angle, 30).value).toBe(60);
    expect(fromNative(flow, 98).value).toBe(0.98);
    expect(toNative(flow, 0.98).value).toBe(98);
  });
  test('round trips', () => {
    fc.assert(fc.property(fc.integer({ min: -1e6, max: 1e6 }), (n) => rt(angle, n) === n && rt(flow, n) === n));
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 }),
        (n) => Math.abs((rt(angle, n) as number) - n) < 1e-6,
      ),
    );
  });
  test('errors', () => {
    expect(code(() => fromNative(flow, 'x'))).toBe('not_a_number');
    expect(code(() => toNative({ kind: 'scale', factor: 0 }, 1))).toBe('zero_factor');
  });
});

describe('sign_flip', () => {
  const c: Conversion = { kind: 'sign_flip' };
  test('involution, no -0', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), (n) => Object.is(rt(c, n), n) || n === 0),
    );
    expect(Object.is(fromNative(c, 0).value, 0)).toBe(true);
  });
});

describe('percent_of', () => {
  const c: Conversion = { kind: 'percent_of', of: 'outer_wall_speed' };
  test('a percentage stays relative both ways', () => {
    expect(fromNative(c, '50%').value).toBe('50%');
    expect(toNative(c, '50%').value).toBe('50%');
    expect(rt(c, 12)).toBe(12);
    expect(rt(c, ' 50 % ')).toBe('50%');
  });
  test('resolving needs its base and is flagged lossy', () => {
    expect(code(() => toNative(c, '50%', { resolve: true }))).toBe('percent_base_missing');
    expect(toNative(c, '50%', { resolve: true, base: 60 })).toMatchObject({ value: 30, lossy: expect.any(String) });
  });
  test('garbage is an error', () => expect(code(() => fromNative(c, 'fast'))).toBe('not_a_number'));
});

describe('enum_map', () => {
  const one: Conversion = { kind: 'enum_map', map: { a: 'x', b: 'y' } };
  const many: Conversion = { kind: 'enum_map', map: { a: 'x', b: 'x', c: 'y' }, reverse: { x: 'a', y: 'c' } };
  test('one-to-one round trips', () => {
    expect(rt(one, 'a')).toBe('a');
    expect(fromNative(one, 'b')).toEqual({ value: 'y' });
  });
  test('many-to-one is lossy only for the non-canonical native', () => {
    expect(fromNative(many, 'a').lossy).toBeUndefined();
    expect(fromNative(many, 'b').lossy).toMatch(/both map/);
    expect(rt(many, 'b')).toBe('a');
  });
  test('unmapped values are errors, including inherited object keys', () => {
    expect(code(() => fromNative(one, 'zzz'))).toBe('unmapped_enum_value');
    expect(code(() => toNative(one, 'q'))).toBe('unmapped_enum_value');
    expect(code(() => fromNative(one, 'toString'))).toBe('unmapped_enum_value');
    expect(code(() => fromNative(one, 3))).toBe('unmapped_enum_value');
  });
});

describe('split', () => {
  const list: Conversion = { kind: 'split', keys: ['machine_nozzle_offset_x', 'machine_nozzle_offset_y'] };
  const map: Conversion = {
    kind: 'split',
    keys: { textured_plate: 'textured_plate_temp', cool_plate: 'cool_plate_temp' },
  };
  test('list', () => {
    const n = { machine_nozzle_offset_x: 1, machine_nozzle_offset_y: 2 };
    expect(fromNative(list, n).value).toEqual([1, 2]);
    expect(rt(list, n)).toEqual(n);
  });
  test('surface map', () => {
    const n = { textured_plate_temp: 60, cool_plate_temp: 35 };
    expect(fromNative(map, n).value).toEqual({ textured_plate: 60, cool_plate: 35 });
    expect(rt(map, n)).toEqual(n);
  });
  test('mismatches are errors', () => {
    expect(code(() => fromNative(list, { machine_nozzle_offset_x: 1 }))).toBe('split_mismatch');
    expect(code(() => toNative(list, [1]))).toBe('split_mismatch');
    expect(code(() => toNative(map, { cool_plate: 1 }))).toBe('split_mismatch');
    expect(code(() => toNative(map, 5))).toBe('split_mismatch');
  });
});

test('identity and absent conversion pass through', () => {
  fc.assert(
    fc.property(
      fc.oneof(fc.string(), fc.double({ noNaN: true }), fc.boolean()),
      (v) => rt(undefined, v) === v && rt({ kind: 'identity' }, v) === v,
    ),
  );
});
