// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser-side helper: cheap synthetic 28-byte move records (D17 layout), written in place.

export const STRIDE = 28;

/** `count` extrusions along x on rows 1 mm apart, 64 per layer; time advances 0.1 s per move. */
export function syntheticMoves(count: number): { buffer: ArrayBuffer; layerStarts: number[] } {
  const buffer = new ArrayBuffer(count * STRIDE);
  return { buffer, layerStarts: writeSyntheticMoves(buffer, 0, count) };
}

/** Writes records `from .. to - 1` into `buffer` and returns the layer starts among them. */
export function writeSyntheticMoves(buffer: ArrayBuffer, from: number, to: number): number[] {
  const v = new DataView(buffer);
  const layerStarts: number[] = [];
  for (let i = from; i < to; i++) {
    const o = i * STRIDE;
    if (i % 64 === 1) layerStarts.push(i);
    v.setFloat32(o, i % 2 ? 60 : 2, true);
    v.setFloat32(o + 4, (i >> 1) % 60, true);
    v.setFloat32(o + 8, 0.2 * (1 + (i >> 6)), true);
    v.setFloat16(o + 12, 0.5, true);
    v.setFloat16(o + 14, 0.2, true);
    v.setUint8(o + 16, 1 + (i % 5));
    v.setUint8(o + 17, i % 2);
    v.setUint32(o + 20, i, true);
    v.setFloat32(o + 24, i * 0.1, true);
  }
  return layerStarts;
}
