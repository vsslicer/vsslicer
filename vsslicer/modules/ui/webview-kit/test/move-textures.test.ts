// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { MOVE_WORDS, planMoveChunks, uploadMoveTextures } from '../src/gl/index.ts';

test('chunks cover every record, overlap by one and fit the texture', () => {
  for (const [count, max] of [
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [100, 4],
    [1000, 8],
    [15_000_000, 16384],
  ] as const) {
    const chunks = planMoveChunks(count, max);
    const per = Math.floor((max * max) / MOVE_WORDS);
    let next = 0;
    for (const [k, c] of chunks.entries()) {
      expect(c.firstRecord).toBe(k === 0 ? 0 : next - 1);
      expect(c.recordCount).toBeLessThanOrEqual(per);
      next = c.firstRecord + c.recordCount;
    }
    expect(next).toBe(count);
  }
  expect(planMoveChunks(15_000_000, 16384)).toHaveLength(1);
  expect(() => planMoveChunks(10, 3)).toThrow(RangeError);
});

// A WebGL2 stand-in that keeps each texture's texels, to check the addressing the GLSL uses.
function fakeGl(max: number) {
  const textures: { w: number; h: number; texels: Uint32Array }[] = [];
  let bound: (typeof textures)[number] | undefined;
  let uploads = 0;
  const gl = new Proxy(
    {
      MAX_TEXTURE_SIZE: 1,
      getParameter: () => max,
      createTexture: () => ({}),
      bindTexture: (_: number, t: object) => {
        bound = t as never;
      },
      texStorage2D: (_t: number, _l: number, _f: number, w: number, h: number) => {
        expect(w).toBeLessThanOrEqual(max);
        expect(h).toBeLessThanOrEqual(max);
        Object.assign(bound!, { w, h, texels: new Uint32Array(w * h) });
        textures.push(bound!);
      },
      texSubImage2D: (...a: unknown[]) => {
        const [, , x, y, w, h, , , data] = a as [0, 0, number, number, number, number, 0, 0, Uint32Array];
        expect(data).toHaveLength(w * h);
        for (let r = 0; r < h; r++) bound!.texels.set(data.subarray(r * w, (r + 1) * w), (y + r) * bound!.w + x);
        uploads++;
      },
    },
    { get: (o, k) => (k in o ? o[k as keyof typeof o] : typeof k === 'string' && /^[A-Z_]+$/.test(k) ? 0 : () => {}) },
  ) as unknown as WebGL2RenderingContext;
  return { gl, textures, uploads: () => uploads };
}

test('every chunk texel holds the record word the GLSL addressing expects', () => {
  const count = 100;
  const words = new Uint32Array(count * MOVE_WORDS).map((_, i) => i + 1);
  const { gl, textures, uploads } = fakeGl(8);
  const chunks = uploadMoveTextures(gl, words.buffer);
  expect(chunks.length).toBeGreaterThan(1);
  expect(uploads()).toBeLessThanOrEqual(2 * chunks.length);
  for (const [k, c] of chunks.entries()) {
    const t = textures[k]!;
    for (let r = 0; r < c.recordCount; r++)
      for (let j = 0; j < MOVE_WORDS; j++) {
        const i = r * MOVE_WORDS + j;
        expect(t.texels[(Math.floor(i / t.w) * t.w + (i % t.w)) as number]).toBe(
          words[(c.firstRecord + r) * MOVE_WORDS + j],
        );
      }
  }
});

test('a buffer that is not whole records is refused', () => {
  expect(() => uploadMoveTextures(fakeGl(8).gl, new ArrayBuffer(30))).toThrow(RangeError);
});
