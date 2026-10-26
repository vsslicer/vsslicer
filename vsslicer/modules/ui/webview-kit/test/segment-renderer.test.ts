// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { analyseMoves, chunkInstances } from '../src/gl/segment-renderer.ts';

describe('chunkInstances', () => {
  const chunk = { firstRecord: 10, recordCount: 5 }; // ends moves 11..14 (local 1..4)
  it('intersects the visible range with the moves a chunk ends', () => {
    expect(chunkInstances(chunk, 0, 1e9)).toEqual({ lo: 1, n: 4 });
    expect(chunkInstances(chunk, 12, 2)).toEqual({ lo: 2, n: 2 });
    expect(chunkInstances(chunk, 14, 100)).toEqual({ lo: 4, n: 1 });
  });
  it('skips chunks outside the range and never draws local record 0', () => {
    expect(chunkInstances(chunk, 15, 3)).toBeNull();
    expect(chunkInstances(chunk, 1, 10)).toBeNull(); // moves 1..10; 10 is the previous chunk's
    expect(chunkInstances(chunk, 12, 0)).toBeNull();
  });
});

describe('analyseMoves', () => {
  // Records along x at 10 mm steps, start times 0, 1, 3, 4; record 2 is a travel.
  const moves = () => {
    const v = new DataView(new ArrayBuffer(4 * 28));
    [0, 1, 3, 4].forEach((t, i) => {
      v.setFloat32(i * 28, 10 * i, true);
      v.setFloat32(i * 28 + 24, t, true);
    });
    v.setUint8(2 * 28 + 18, 1);
    return v.buffer;
  };
  it('takes the speed range over non-travel moves and the time of each layer', () => {
    const { table, ranges } = analyseMoves(moves(), [1, 2]);
    expect(ranges.speed).toEqual([5, 5]); // move 1: 10 mm from t 1 to t 3; move 2 is a travel
    expect(Array.from(table.filter((_, i) => i % 2 === 0))).toEqual([1, 2]);
    expect(Array.from(new Float32Array(table.buffer).filter((_, i) => i % 2 === 1))).toEqual([2, 1]);
    expect(ranges.layerTime).toEqual([1, 2]);
  });
  it('reports [0, 0] when start times are unknown', () => {
    expect(analyseMoves(new ArrayBuffer(3 * 28), []).ranges.speed).toEqual([0, 0]); // zero durations
    const nan = new DataView(new ArrayBuffer(3 * 28));
    [0, 1, 2].forEach((i) => nan.setFloat32(i * 28 + 24, NaN, true));
    expect(analyseMoves(nan.buffer, [1]).ranges).toEqual({ speed: [0, 0], layerTime: [0, 0] });
  });
});
