// SPDX-License-Identifier: AGPL-3.0-or-later
// Deterministic synthetic print: perimeters, random infill, travels, retractions and accel changes.
// Not committed as files (they run to megabytes); tests and the recording script regenerate them.
export interface SyntheticSpec {
  name: string;
  seed: number;
  layers: number;
  /** Print feed, mm/s. */
  speed: number;
  /** Infill lines per layer. */
  infill: number;
}

/** About 12 h on klipper_estimator with `printer.json`; `scaled` ones are about 1 h. */
export const SYNTHETIC: SyntheticSpec[] = [
  { name: 'synthetic-12h-a', seed: 1, layers: 105, speed: 60, infill: 400 },
  { name: 'synthetic-12h-b', seed: 2, layers: 68, speed: 25, infill: 300 },
  { name: 'synthetic-1h', seed: 3, layers: 14, speed: 40, infill: 200 },
];

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function syntheticGcode(spec: SyntheticSpec): string {
  const r = rng(spec.seed);
  const out: string[] = ['M83', 'G90', 'G1 X50 Y50 Z0.2 F18000'];
  let x = 50;
  let y = 50;
  const line = (nx: number, ny: number, f: number): void => {
    const e = Math.hypot(nx - x, ny - y) * 0.04;
    out.push(`G1 X${nx.toFixed(3)} Y${ny.toFixed(3)} E${e.toFixed(5)} F${Math.round(f * 60)}`);
    x = nx;
    y = ny;
  };
  const travel = (nx: number, ny: number): void => {
    out.push('G1 E-0.8 F2400', `G0 X${nx.toFixed(3)} Y${ny.toFixed(3)} F18000`, 'G1 E0.8 F1800');
    x = nx;
    y = ny;
  };
  for (let l = 0; l < spec.layers; l++) {
    out.push(`G1 Z${(0.2 * (l + 1)).toFixed(2)} F600`);
    if (l % 3 === 0) out.push(`M204 S${[1500, 3000, 5000][Math.floor(r() * 3)]}`);
    const s = 20 + r() * 100;
    travel(40 + r() * 20, 40 + r() * 20);
    const [x0, y0] = [x, y];
    line(x0 + s, y0, spec.speed);
    line(x0 + s, y0 + s, spec.speed);
    line(x0, y0 + s, spec.speed);
    line(x0, y0, spec.speed);
    for (let i = 0; i < spec.infill; i++) {
      if (i % 25 === 24) travel(x0 + r() * s, y0 + r() * s);
      line(x0 + r() * s, y0 + r() * s, spec.speed * (0.4 + r() * 0.8));
    }
  }
  return out.join('\n') + '\n';
}
