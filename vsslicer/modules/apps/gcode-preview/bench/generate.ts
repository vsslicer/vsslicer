// SPDX-License-Identifier: AGPL-3.0-or-later
// Copy of gcode-parser/bench/generate.ts (modules cannot import each other's files); GCP-42 uses it for the memory budget.
// Deterministic synthetic G-code for the memory/throughput benchmark (GCP-18, profiles from GCP-17 / D17).
// MB = 10^6 bytes. The same (profile, bytes, seed) always yields the same bytes.

export type Profile = 'straight' | 'arc-heavy';

/** mulberry32: small seeded PRNG. */
const prng = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const CHUNK = 1 << 20;
const LAYER_EVERY = 2000; // lines between layer changes

/** The file as 1 MiB pieces, `bytes` long in total (the last piece is cut to fit). */
export function* generate(profile: Profile, bytes: number, seed = 1): Generator<Uint8Array> {
  const rnd = prng(seed);
  const enc = new TextEncoder();
  let x = 100;
  let y = 100;
  let z = 0.2;
  let line = 0;
  let sent = 0;
  let pending = '';
  const f = (n: number): string => n.toFixed(3);
  // back to the bed centre with a travel move once the walk leaves the bed
  const recentre = (): string => {
    if (x >= 10 && x <= 240 && y >= 10 && y <= 240) return '';
    x = y = 120;
    return 'G0 X120.000 Y120.000\n';
  };
  const straight = (): string => {
    x += (rnd() - 0.5) * 4;
    y += (rnd() - 0.5) * 4;
    return `G1 X${f(x)} Y${f(y)} E${(rnd() * 0.05).toFixed(5)}\n${recentre()}`;
  };
  // one G2/G3 of about 45-80 degrees: about 5 chords at the 15 degree default
  const arc = (): string => {
    const r = 2 + rnd() * 6;
    const a0 = rnd() * 2 * Math.PI;
    const sweep = ((45 + rnd() * 35) * Math.PI) / 180;
    const cw = rnd() < 0.5;
    const a1 = cw ? a0 - sweep : a0 + sweep;
    const cx = x - r * Math.cos(a0);
    const cy = y - r * Math.sin(a0);
    x = cx + r * Math.cos(a1);
    y = cy + r * Math.sin(a1);
    const i = cx - (cx + r * Math.cos(a0)); // = -r cos a0, relative to the start point
    const j = cy - (cy + r * Math.sin(a0));
    return `${cw ? 'G2' : 'G3'} X${f(x)} Y${f(y)} I${f(i)} J${f(j)} E${(rnd() * 0.2).toFixed(5)}\n${recentre()}`;
  };
  const next = (): string => {
    line++;
    if (line % LAYER_EVERY === 0) {
      z += 0.2;
      return `;LAYER_CHANGE\n;Z:${z.toFixed(1)}\nG1 Z${z.toFixed(1)} F1200\n`;
    }
    if (profile === 'straight') return straight();
    // arc-heavy: 24% arcs, ~58k moves/MB, ~73% of them arc chords, ~5.8 chords per arc (GCP-17: 57k, 72%, 5.5)
    const r = rnd();
    if (r < 0.24) return arc();
    if (r < 0.24 + 0.02) return `; feature arc fit ${line}\n`;
    return `G1 X${f((x += rnd() - 0.5))} Y${f((y += rnd() - 0.5))} E${(rnd() * 0.02).toFixed(5)}\n${recentre()}`;
  };
  while (sent < bytes) {
    while (pending.length < CHUNK) pending += next();
    const buf = enc.encode(pending);
    const piece = buf.subarray(0, Math.min(CHUNK, bytes - sent));
    // keep the cut-off remainder (re-encoded) so no line is lost between pieces
    pending = new TextDecoder().decode(buf.subarray(piece.length));
    sent += piece.length;
    yield piece;
  }
}
