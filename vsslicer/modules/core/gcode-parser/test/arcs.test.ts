// SPDX-License-Identifier: AGPL-3.0-or-later
import { MoveFlag, StateKind } from '@vsslicer/gcode-api';
import { describe, expect, it } from 'vitest';
import { run } from './support/run.ts';

const TOL = 0.05;
type P = { x: number; y: number; z: number };
const dist = (a: number, b: number, c: number, d: number): number => Math.hypot(a - c, b - d);

/** Every vertex (and chord midpoint) of `pts` from the start is within tolerance of the circle at (cx, cy). */
function expectOnCircle(pts: P[], cx: number, cy: number, r: number): void {
  for (const [i, p] of pts.entries()) {
    expect(Math.abs(dist(p.x, p.y, cx, cy) - r), `vertex ${i}`).toBeLessThan(1e-4);
    const q = pts[i + 1];
    if (q) expect(r - dist((p.x + q.x) / 2, (p.y + q.y) / 2, cx, cy), `chord ${i}`).toBeLessThanOrEqual(TOL + 1e-4);
  }
}

describe('G2/G3 with I/J', () => {
  it('cuts a half circle into chords within the tolerance, ending exactly at the end point', async () => {
    const r = await run('G1 X0 Y0\nG3 X10 Y0 I5 J0 E1\n');
    const arc = r.moves.slice(1);
    expect(arc.length).toBeGreaterThan(8);
    expect(arc.at(-1)).toMatchObject({ x: 10, y: 0 });
    expectOnCircle([{ x: 0, y: 0, z: 0 }, ...arc], 5, 0, 5);
    // G3 is counter-clockwise: from (0,0) it goes below the x axis
    expect(Math.min(...arc.map((m) => m.y))).toBeCloseTo(-5, 1);
  });
  it('G2 goes clockwise', async () => {
    const r = await run('G1 X0 Y0\nG2 X10 Y0 I5 J0\n');
    expect(Math.max(...r.moves.map((m) => m.y))).toBeCloseTo(5, 1);
  });
  it('each chord keeps the Arc flag and the arc command offset; E is split evenly; F stays', async () => {
    const text = 'M83\nG1 X0 Y0 F1200\n';
    const r = await run(`${text}G3 X10 Y0 I5 J0 E3 F600\nG1 X20 E1\n`);
    const arc = r.moves.slice(1, -1);
    expect(arc.every((m) => m.flags === MoveFlag.Arc && m.fileOffset === text.length)).toBe(true);
    expect(r.moves.at(-1)).toMatchObject({ flags: 0, fileOffset: text.length + 'G3 X10 Y0 I5 J0 E3 F600\n'.length });
    const e = r.e.slice(1, -1);
    expect(e.reduce((a, b) => a + b, 0)).toBeCloseTo(3, 5);
    expect(Math.max(...e) - Math.min(...e)).toBeLessThan(1e-6);
    // the arc adds no state changes of its own: F600 is one change
    expect(r.changes.filter((c) => c.kind === StateKind.Feedrate).map((c) => c.value)).toEqual([20, 10]);
  });
  it('a full circle: start == end with I/J, either direction', async () => {
    for (const [g, sign] of [
      ['G2', -1],
      ['G3', 1],
    ] as const) {
      const r = await run(`M83\nG1 X0 Y0\n${g} I5 J0 E2\n`);
      const arc = r.moves.slice(1);
      expect(arc.length).toBeGreaterThanOrEqual(24);
      expect(arc.at(-1)).toMatchObject({ x: 0, y: 0 });
      expectOnCircle([{ x: 0, y: 0, z: 0 }, ...arc], 5, 0, 5);
      // first chord heads the way the direction says: CCW from the west side of the circle goes down (y < 0)
      expect(Math.sign(arc[0]!.y)).toBe(-sign);
      expect(r.e.slice(1).reduce((a, b) => a + b, 0)).toBeCloseTo(2, 5);
    }
  });
  it('a helix interpolates Z evenly', async () => {
    const r = await run('G1 X0 Y0 Z1\nG3 X10 Y0 Z2 I5 J0\n');
    const z = [1, ...r.moves.slice(1).map((m) => m.z)];
    const steps = z.slice(1).map((v, i) => v - (z[i] ?? 0));
    expect(z.at(-1)).toBeCloseTo(2, 5);
    expect(Math.max(...steps) - Math.min(...steps)).toBeLessThan(1e-5);
    expect(Math.min(...steps)).toBeGreaterThan(0);
  });
  it('takes the end point in G91 and after G92; I/J stay relative to the start', async () => {
    const rel = await run('G1 X5 Y5\nG91\nG3 X10 Y0 I5 J0\n');
    expect(rel.moves.at(-1)).toMatchObject({ x: 15, y: 5 });
    expect(Math.min(...rel.moves.map((m) => m.y))).toBeCloseTo(0, 1);
    // G92 moves the origin, not the toolhead: the machine position is continuous
    const off = await run('G1 X5 Y5\nG92 X100 Y100\nG3 X110 Y100 I5 J0\n');
    expect(off.moves.at(-1)).toMatchObject({ x: 15, y: 5 });
  });
  it('tolerance and maximum angle options set the chord count', async () => {
    const count = async (opts: object): Promise<number> =>
      (await run('G1 X0 Y0\nG3 X10 Y0 I5 J0\n', opts)).moves.length - 1;
    const base = await count({});
    expect(base).toBe(12); // 0.05 mm on a 5 mm radius is 16.2 degrees; the 15 degree cap wins: 180 / 15
    expect(await count({ arcTolerance: 0.5, arcMaxAngle: 180 })).toBe(4);
    expect(await count({ arcTolerance: 0.005 })).toBeGreaterThan(base);
    expect(await count({ arcTolerance: 5, arcMaxAngle: 10 })).toBe(18);
    // invalid values fall back to the defaults
    expect(await count({ arcTolerance: -1, arcMaxAngle: 0 })).toBe(base);
  });
});

describe('G2/G3 with R', () => {
  it('resolves to the same centre as I/J', async () => {
    const ij = await run('G1 X0 Y0\nG3 X8 Y0 I4 J3\n');
    const rr = await run('G1 X0 Y0\nG3 X8 Y0 R5\n');
    expect(rr.moves.map((m) => [m.x, m.y])).toEqual(ij.moves.map((m) => [m.x, m.y]));
    const cw = await run('G1 X0 Y0\nG2 X8 Y0 R5\n');
    const cwIj = await run('G1 X0 Y0\nG2 X8 Y0 I4 J-3\n');
    expect(cw.moves.map((m) => [m.x.toFixed(9), m.y.toFixed(9)])).toEqual(
      cwIj.moves.map((m) => [m.x.toFixed(9), m.y.toFixed(9)]),
    );
  });
  it('a negative R takes the long way round (over 180 degrees)', async () => {
    const short = await run('G1 X0 Y0\nG3 X8 Y0 R5\n');
    const long = await run('G1 X0 Y0\nG3 X8 Y0 R-5\n');
    expect(Math.min(...short.moves.map((m) => m.y))).toBeCloseTo(-2, 1);
    expect(Math.max(...short.moves.map((m) => m.y))).toBeCloseTo(0, 5);
    expect(Math.min(...long.moves.map((m) => m.y))).toBeCloseTo(-8, 1); // centre (4,-3): down to the circle's bottom
    expect(long.moves.length).toBeGreaterThan(short.moves.length);
    expectOnCircle([{ x: 0, y: 0, z: 0 }, ...long.moves.slice(1)], 4, -3, 5);
  });
  it('R wins over I/J', async () => {
    const r = await run('G1 X0 Y0\nG3 X8 Y0 R5 I100 J100\n');
    expect(Math.min(...r.moves.map((m) => m.y))).toBeCloseTo(-2, 1);
  });
});

describe('planes', () => {
  it('G18 arcs in ZX with K (Z) and I (X); Y is the linear axis', async () => {
    const r = await run('G1 X0 Y3 Z0\nG18\nG3 X10 Z0 Y4 I5 K0\n');
    const arc = r.moves.slice(1);
    expect(arc.at(-1)).toMatchObject({ x: 10, y: 4, z: 0 });
    // CCW in (Z, X) from X=0: Z goes positive
    expect(Math.max(...arc.map((m) => m.z))).toBeCloseTo(5, 1);
    for (const m of arc) expect(Math.abs(dist(m.z, m.x, 0, 5) - 5)).toBeLessThan(1e-4);
    expect(arc.every((m) => m.y > 3 && m.y <= 4)).toBe(true);
  });
  it('G19 arcs in YZ with J (Y) and K (Z); X is the linear axis', async () => {
    const r = await run('G1 X1 Y0 Z0\nG19\nG2 Y0 Z10 X2 J0 K5\n');
    const arc = r.moves.slice(1);
    expect(arc.at(-1)).toMatchObject({ x: 2, y: 0, z: 10 });
    // CW in (Y, Z) from Z=0 (towards +Z): Y goes negative
    expect(Math.min(...arc.map((m) => m.y))).toBeCloseTo(-5, 1);
    for (const m of arc) expect(Math.abs(dist(m.y, m.z, 0, 5) - 5)).toBeLessThan(1e-4);
  });
  it('G17 restores XY', async () => {
    const r = await run('G18\nG17\nG1 X0 Y0\nG3 X10 Y0 I5 J0\n');
    expect(Math.min(...r.moves.map((m) => m.y))).toBeCloseTo(-5, 1);
  });
});

describe('invalid arcs', () => {
  const cases: [string, string, string][] = [
    ['end radius differs from start radius', 'G2 X10 Y0 I2 J0', 'differ'],
    ['R too small for the chord', 'G2 X10 Y0 R3', 'too small'],
    ['R full circle', 'G2 X0 Y0 R5', 'full circle'],
    ['no centre', 'G2 X10 Y0', 'no centre'],
    ['zero radius', 'G2 I0 J0', 'zero'],
  ];
  it.each(cases)('%s: diagnostic and a straight move', async (_name, line, text) => {
    const r = await run(`G1 X0 Y0\n${line} E1\n`);
    expect(r.diagnostics.map((d) => d.code)).toEqual(['arc-invalid']);
    expect(r.diagnostics[0]).toMatchObject({ severity: 'warning', fileOffset: 9 });
    expect(r.diagnostics[0]?.message).toContain(text);
    expect(r.moves).toHaveLength(2);
    expect(r.moves[1]).toMatchObject({ flags: MoveFlag.Arc, fileOffset: 9 });
    expect(r.e[1]).toBe(1);
  });
  it('a radius within the tolerance is accepted', async () => {
    const r = await run('G1 X0 Y0\nG2 X10 Y0.02 I5 J0\n');
    expect(r.diagnostics).toEqual([]);
    expect(r.moves.at(-1)?.y).toBeCloseTo(0.02, 5);
  });
  it('R barely too small (rounding) is a half circle, not an error', async () => {
    const r = await run('G1 X0 Y0\nG3 X10 Y0 R4.99\n');
    expect(r.diagnostics).toEqual([]);
  });
  it('reports at most 100 bad arcs', async () => {
    const r = await run('G1 X0 Y0\n' + 'G2 X10 Y0\n'.repeat(150));
    expect(r.diagnostics).toHaveLength(100);
  });
});
