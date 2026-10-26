// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import {
  analyseMoves,
  chunkInstances,
  halfToNumber,
  createSegmentRenderer,
  stateSteps,
} from '../src/gl/segment-renderer.ts';

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

const f16 = (x: number) => {
  const d = new DataView(new ArrayBuffer(2));
  d.setFloat16(0, x, true);
  return d.getUint16(0, true);
};

describe('halfToNumber', () => {
  it('decodes normals, subnormals, signs and specials', () => {
    for (const x of [0, 0.5, -2, 0.2, 65504, 2 ** -24, 3 * 2 ** -24])
      expect(halfToNumber(f16(x))).toBe(new Float16Array([x])[0]);
    expect(halfToNumber(f16(Infinity))).toBe(Infinity);
    expect(halfToNumber(f16(NaN))).toBeNaN();
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
  it('takes the width and flow ranges over non-travel moves with a cross-section', () => {
    const v = new DataView(moves());
    [
      [0.5, 0.2],
      [0.5, 0.2],
      [0.4, 0.2],
      [0.6, 0.3],
    ].forEach(([w, h], i) => {
      v.setUint16(i * 28 + 12, f16(w!), true);
      v.setUint16(i * 28 + 14, f16(h!), true);
    });
    const { ranges } = analyseMoves(v.buffer, [1, 2]);
    expect(ranges.width[0]).toBeCloseTo(0.5, 3); // record 2 is a travel
    expect(ranges.width[1]).toBeCloseTo(0.6, 3); // record 3 is the last: width counts, no flow (no next start)
    expect(ranges.flow[0]).toBeCloseTo(5 * 0.5 * 0.2, 3); // 5 mm/s
    expect(ranges.flow[1]).toBeCloseTo(5 * 0.5 * 0.2, 3);
  });
  it('reports [0, 0] when start times are unknown', () => {
    expect(analyseMoves(new ArrayBuffer(3 * 28), []).ranges.speed).toEqual([0, 0]); // zero durations
    const nan = new DataView(new ArrayBuffer(3 * 28));
    [0, 1, 2].forEach((i) => nan.setFloat32(i * 28 + 24, NaN, true));
    expect(analyseMoves(nan.buffer, [1]).ranges).toEqual({
      speed: [0, 0],
      layerTime: [0, 0],
      width: [0, 0],
      flow: [0, 0],
    });
  });
});

describe('createSegmentRenderer', () => {
  const fake = () => {
    const next: number[] = [];
    const gl = new Proxy(
      {
        getParameter: () => 8,
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        getUniformLocation: (_p: unknown, n: string) => n,
        uniform1ui: (l: string, v: number) => l === 'uNextStart' && next.push(v),
      },
      {
        get: (o, k) =>
          k in o ? o[k as keyof typeof o] : typeof k === 'string' && /^[A-Z_0-9]+$/.test(k) ? 0 : () => ({}),
      },
    ) as unknown as WebGL2RenderingContext;
    return { gl, next };
  };
  it('refuses a typed-array view', () => {
    expect(() => createSegmentRenderer(fake().gl, new Uint8Array(28 * 3) as never)).toThrow(TypeError);
  });
  it('does not read the move buffer after creation', () => {
    // maxTextureSize 4 holds 2 records per chunk, so the chunks have real next-start values.
    const buf = new ArrayBuffer(5 * 28);
    const v = new DataView(buf);
    for (let i = 0; i < 5; i++) v.setFloat32(i * 28 + 24, i, true);
    const { gl, next } = fake();
    const r = createSegmentRenderer(gl, buf, { maxTextureSize: 4 });
    structuredClone(buf, { transfer: [buf] }); // detaches: a renderer that kept a view would now see zero length
    r.draw({ view: new Float32Array(16), projection: new Float32Array(16), first: 0, count: 100, colorMode: 0 });
    expect(next.length).toBeGreaterThan(1);
    expect(next.slice(0, -1).every((b) => b !== 0x7fc00000)).toBe(true);
  });
});

describe('stateSteps', () => {
  // [moveIndex, kind, index, value]; kinds of @vsslicer/gcode-api StateKind: Fan 1, HotendTemp 2, ToolChange 20.
  const [FAN, HOTEND, TOOL, FEEDRATE] = [1, 2, 20, 0];
  const table = (...rows: number[][]) => {
    const v = new DataView(new ArrayBuffer(12 * rows.length));
    rows.forEach(([move, kind, index, value], i) => {
      v.setUint32(12 * i, move!, true);
      v.setFloat32(12 * i + 4, value!, true);
      v.setUint8(12 * i + 8, kind!);
      v.setUint8(12 * i + 9, index!);
    });
    return v.buffer;
  };
  const rows = (s: { table: Uint32Array }) => {
    const f = new Float32Array(s.table.buffer);
    return Array.from({ length: s.table.length / 2 }, (_, i) => [s.table[2 * i], f[2 * i + 1]]);
  };
  it('folds the part fan (no P or P1) into % per move, starting at 0', () => {
    const { fan } = stateSteps(
      [table([2, FAN, 0, 0.5], [5, FAN, 1, 1]), table([6, FAN, 2, 0.25], [7, FEEDRATE, 0, 30], [8, FAN, 0, 0])],
      10,
    );
    expect(rows(fan)).toEqual([
      [0, 0],
      [2, 50],
      [5, 100],
      [8, 0],
    ]);
    expect(fan.range).toEqual([0, 100]);
  });
  it("takes the active tool's hotend target, NaN until it is set", () => {
    const { temperature } = stateSteps(
      [table([0, HOTEND, 0, 200], [4, HOTEND, 1, 250], [6, TOOL, 0, 1], [7, HOTEND, 1, 240], [9, TOOL, 0, 2])],
      10,
    );
    expect(rows(temperature)).toEqual([
      [0, 200],
      [6, 250],
      [7, 240],
      [9, NaN],
    ]);
    expect(temperature.range).toEqual([200, 250]);
    expect(rows(stateSteps([], 3).temperature)).toEqual([[0, NaN]]);
    expect(stateSteps([], 3).temperature.range).toEqual([0, 0]);
  });
  it('keeps the later of two changes at one move and drops repeats', () => {
    expect(rows(stateSteps([table([3, FAN, 0, 0.2], [3, FAN, 0, 0.4], [4, FAN, 0, 0.4])], 9).fan)).toEqual([
      [0, 0],
      [3, 40],
    ]);
  });
  it('leaves a change after the last move out of the range', () => {
    const { temperature } = stateSteps([table([1, HOTEND, 0, 210], [10, HOTEND, 0, 300])], 10);
    expect(rows(temperature).at(-1)).toEqual([10, 300]);
    expect(temperature.range).toEqual([210, 210]);
  });
  it('holds at most moveCount + 1 rows however many changes there are', () => {
    // 600 changes over moves 0..5, alternating values: the cap of 6 rows is reached and kept.
    const many = Array.from({ length: 600 }, (_, i) => [Math.floor(i / 100), FAN, 0, i % 2]);
    expect(stateSteps([table(...many)], 5).fan.table.length).toBe(2 * 6);
    // a change at move moveCount + 1 is refused
    expect(() => stateSteps([table([6, FAN, 0, 1])], 5)).toThrow(RangeError);
    expect(stateSteps([table([5, FAN, 0, 1])], 5).fan.table.length).toBe(4);
  });
  it('refuses changes out of order, bad buffers and a bad move count', () => {
    expect(() => stateSteps([table([3, FAN, 0, 1]), table([2, FAN, 0, 0])], 9)).toThrow(RangeError);
    expect(() => stateSteps([new ArrayBuffer(13)], 9)).toThrow(/not a multiple of 12/);
    expect(() => stateSteps([new Uint8Array(12) as never], 9)).toThrow(/must be ArrayBuffers/);
    for (const n of [-1, NaN, Infinity, 1.5]) expect(() => stateSteps([], n)).toThrow(RangeError);
  });
});
