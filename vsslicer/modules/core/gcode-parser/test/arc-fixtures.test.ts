// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MoveFlag } from '@vsslicer/gcode-api';
import type { Move } from '@vsslicer/gcode-api';
import { describe, expect, it } from 'vitest';
import { tessellateArc } from '../src/domain/arc.ts';
import { fixturesDir } from './support/golden.ts';
import { run } from './support/run.ts';

/** Arc-fitted slicer output (GCP-10). No PrusaSlicer arc fixture exists yet (owner question Q11). */
const FIXTURES = [
  'orca/cylinder-arcs-on-x1c.gcode',
  'bambu-studio/cylinder-arcs-on.gcode',
  'superslicer/superslicer-2.3.56-arcwelder.gcode',
];
const TOL = 0.05;
const F32 = 2e-4; // coordinates are float32 (about 1e-5 at 150 mm) and the G-code has 3 decimals

interface Arc {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  i: number;
  j: number;
  cw: boolean;
  /** Whole circle centre and radius, worked out here from start and I/J only. */
  cx: number;
  cy: number;
  r: number;
}

/** A line scan that shares nothing with the parser: absolute XY only (all three fixtures are G90, G17). */
function scanArcs(text: string): Arc[] {
  const arcs: Arc[] = [];
  let x = 0;
  let y = 0;
  for (const raw of text.split('\n')) {
    const m = /^(G[0-3])\s([^;]*)/.exec(raw);
    if (!m) continue;
    const w = (c: string): number | undefined => {
      const v = new RegExp(`\\b${c}(-?[\\d.]+)`).exec(m[2] ?? '');
      return v ? Number(v[1]) : undefined;
    };
    const nx = w('X') ?? x;
    const ny = w('Y') ?? y;
    if (m[1] === 'G2' || m[1] === 'G3') {
      const i = w('I') ?? 0;
      const j = w('J') ?? 0;
      arcs.push({ sx: x, sy: y, ex: nx, ey: ny, i, j, cw: m[1] === 'G2', cx: x + i, cy: y + j, r: Math.hypot(i, j) });
    }
    x = nx;
    y = ny;
  }
  return arcs;
}

/** Counter-clockwise-positive sweep from start to end about the centre, in the arc's direction. */
function sweepOf(a: Arc): number {
  const s = Math.atan2(a.sy - a.cy, a.sx - a.cx);
  const e = Math.atan2(a.ey - a.cy, a.ex - a.cx);
  let d = e - s;
  if (Math.hypot(a.ex - a.sx, a.ey - a.sy) < 1e-4) return a.cw ? -2 * Math.PI : 2 * Math.PI; // full circle
  if (a.cw) while (d > 0) d -= 2 * Math.PI;
  else while (d < 0) d += 2 * Math.PI;
  return d;
}

/** The arcs' chord runs: consecutive Arc moves share the command's file offset. */
function chordRuns(moves: Move[]): Move[][] {
  const runs: Move[][] = [];
  for (const m of moves) {
    if (!(m.flags & MoveFlag.Arc)) continue;
    const last = runs.at(-1);
    if (last && last[0]?.fileOffset === m.fileOffset) last.push(m);
    else runs.push([m]);
  }
  return runs;
}

const load = (path: string): string => readFileSync(join(fixturesDir, path), 'utf8');

describe.each(FIXTURES)('%s', (path) => {
  const text = load(path);
  const arcs = scanArcs(text);

  it('uses I/J only', () => {
    expect(arcs.length).toBeGreaterThan(100);
    expect(/^G[23]\s.*\bR-?\d/m.test(text)).toBe(false);
  });

  it('tessellates every arc within 0.05 mm of the true circle, chord sagitta <= 0.05, ending on the end point', async () => {
    const r = await run(text);
    expect(r.all.filter((d) => d.code === 'arc-invalid')).toEqual([]);
    const runs = chordRuns(r.moves);
    expect(runs.length).toBe(arcs.length);
    let worstDev = 0;
    let worstSag = 0;
    for (const [n, a] of arcs.entries()) {
      const run = runs[n]!;
      const sweep = Math.abs(sweepOf(a));
      let prev = { x: a.sx, y: a.sy };
      for (const v of run) {
        worstDev = Math.max(worstDev, Math.abs(Math.hypot(v.x - a.cx, v.y - a.cy) - a.r));
        // sagitta: the chord midpoint's distance inside the circle; plus the vertex must be inside the sweep
        worstSag = Math.max(worstSag, a.r - Math.hypot((v.x + prev.x) / 2 - a.cx, (v.y + prev.y) / 2 - a.cy));
        prev = v;
      }
      expect(Math.hypot(prev.x - a.ex, prev.y - a.ey), `arc ${n} end`).toBeLessThan(F32);
      // the chords cover the sweep: the angle they span adds up to the arc's sweep
      let covered = 0;
      let p = { x: a.sx, y: a.sy };
      for (const v of run) {
        const d = Math.atan2(v.y - a.cy, v.x - a.cx) - Math.atan2(p.y - a.cy, p.x - a.cx);
        covered += Math.abs(((d + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
        p = v;
      }
      expect(covered, `arc ${n} sweep`).toBeCloseTo(sweep, 2);
    }
    expect(worstDev).toBeLessThan(TOL);
    expect(worstSag).toBeLessThanOrEqual(TOL + F32);
  });

  it('R form of the same arc gives the same centre and tessellation as I/J', async () => {
    let checked = 0;
    for (const a of arcs) {
      const sweep = Math.abs(sweepOf(a));
      // a full circle cannot be written with R, and a half circle has no sign to give it
      if (sweep > 2 * Math.PI - 1e-3 || Math.abs(sweep - Math.PI) < 1e-3) continue;
      // put the end exactly on the circle (the file's end is rounded to 3 decimals), so I/J and R describe one arc
      const ang = Math.atan2(a.ey - a.cy, a.ex - a.cx);
      const ex = a.cx + a.r * Math.cos(ang);
      const ey = a.cy + a.r * Math.sin(ang);
      const R = sweep > Math.PI ? -a.r : a.r;
      const g = a.cw ? 'G2' : 'G3';
      const base = `G90\nG1 X${a.sx} Y${a.sy}\n`;
      const ij = await run(`${base}${g} X${ex} Y${ey} I${a.i} J${a.j}\n`);
      const rr = await run(`${base}${g} X${ex} Y${ey} R${R}\n`);
      expect(ij.all.filter((d) => d.code === 'arc-invalid')).toEqual([]);
      expect(rr.all.filter((d) => d.code === 'arc-invalid')).toEqual([]);
      expect(rr.moves.length).toBe(ij.moves.length);
      for (const [k, m] of rr.moves.entries()) {
        expect(Math.abs(m.x - ij.moves[k]!.x)).toBeLessThan(F32);
        expect(Math.abs(m.y - ij.moves[k]!.y)).toBeLessThan(F32);
      }
      // the parser's maths in float64: same vertices to 1e-6, so the same centre
      const input = {
        start: [a.sx, a.sy, 0],
        end: [ex, ey, 0],
        plane: 17,
        tolerance: TOL,
        maxAngle: Math.PI / 12,
      } as const;
      const nan = [NaN, NaN, NaN] as const;
      const t1 = tessellateArc({ ...input, ijk: [a.i, a.j, NaN], radius: NaN, clockwise: a.cw });
      const t2 = tessellateArc({ ...input, ijk: nan, radius: R, clockwise: a.cw });
      if (!t1.ok || !t2.ok) throw new Error('arc rejected');
      expect(t2.points.length).toBe(t1.points.length);
      t1.points.forEach((v, k) => expect(Math.abs(v - t2.points[k]!)).toBeLessThan(1e-6));
      checked++;
    }
    expect(checked).toBeGreaterThan(arcs.length * 0.9);
  }, 120_000);
});

describe('orca cylinder: arcs on vs arcs off', () => {
  it('every arcs-on arc vertex lies within 0.05 mm + the fitting resolution of the arcs-off path', async () => {
    const resolution = Number(/^; resolution = ([\d.]+)/m.exec(load('orca/cylinder-arcs-on-x1c.gcode'))?.[1]);
    expect(resolution).toBe(0.012);
    const on = await run(load('orca/cylinder-arcs-on-x1c.gcode'));
    const off = await run(load('orca/cylinder-arcs-off-x1c.gcode'));
    // arcs-off extrusion segments (its Z ramps within a layer, so match by height within 0.05 mm)
    const offSegs: { z: number; s: number[] }[] = [];
    for (const [k, m] of off.moves.entries()) {
      const p = off.moves[k - 1];
      if (p && m.flags === 0) offSegs.push({ z: m.z, s: [p.x, p.y, m.x, m.y] });
    }
    const segDist = (x: number, y: number, [ax, ay, bx, by]: number[]): number => {
      const dx = bx! - ax!;
      const dy = by! - ay!;
      const t = Math.max(0, Math.min(1, ((x - ax!) * dx + (y - ay!) * dy) / (dx * dx + dy * dy || 1)));
      return Math.hypot(x - ax! - t * dx, y - ay! - t * dy);
    };
    let worst = 0;
    let n = 0;
    for (const m of on.moves) {
      if (m.flags !== MoveFlag.Arc) continue; // extruding chords only
      const near = offSegs.filter((o) => Math.abs(o.z - m.z) < 0.05);
      worst = Math.max(worst, Math.min(...near.map((o) => segDist(m.x, m.y, o.s))));
      n++;
    }
    expect(n).toBeGreaterThan(500);
    expect(worst).toBeLessThanOrEqual(TOL + resolution);
  }, 120_000);
});
