// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole, readMove } from '@vsslicer/gcode-api';
import type { ParsedFile } from '@vsslicer/gcode-api';
import {
  ToolheadWindow,
  constantSpeedPlanner,
  createKlipperPlanner,
  moveAtTime,
  planSync,
  resolveLimits,
  trapezoidsFor,
} from '../src/index.ts';
import type { Planner, ToolheadSample, Trapezoid } from '../src/index.ts';
import { fixture } from './harness.ts';
import type { FixtureMove } from './harness.ts';

const T = MoveFlag.Travel;
const limits = resolveLimits({ flavour: 'klipper', override: { accel: 1000, maxVelocity: 300 } });
const klipper = createKlipperPlanner();

function point(parsed: ParsedFile, i: number): [number, number, number] {
  if (i < 0) return [0, 0, 0];
  let b = 0;
  while (i * MOVE_STRIDE >= parsed.moves[b]!.byteLength) i -= parsed.moves[b++]!.byteLength / MOVE_STRIDE;
  const m = readMove(new DataView(parsed.moves[b]!), i);
  return [m.x, m.y, m.z];
}

/**
 * Distance along move `i` at `tau` seconds into its motion, by numerically integrating the
 * trapezoid's speed min(entry + a t, cruise, exit + a (T - t)): independent of interp.ts's closed form.
 */
function distance(tr: Tr, tau: number): number {
  const { entry: v0, cruise: vc, exit: v1, accel: a } = tr;
  const steps = 20_000;
  const h = tau / steps;
  let s = 0;
  for (let k = 0; k < steps; k++) {
    const u = (k + 0.5) * h;
    s += Math.min(v0 + a * u, vc, v1 + a * (tr.motion! - u)) * h;
  }
  return s;
}

type Tr = Trapezoid & { motion?: number };

/** The trapezoid's motion time for a move of `len` mm. */
function motionTime(tr: Trapezoid, len: number): number {
  const { entry: v0, cruise: vc, exit: v1, accel: a } = tr;
  const da = (vc * vc - v0 * v0) / (2 * a);
  const dd = (vc * vc - v1 * v1) / (2 * a);
  return (vc - v0) / a + (len - da - dd) / vc + (vc - v1) / a;
}

/** Where the planner's trapezoid puts the toolhead at `t`, inside move `i`. */
function expected(parsed: ParsedFile, traps: Tr[], i: number, t: number): [number, number, number] {
  const a = point(parsed, i - 1);
  const b = point(parsed, i);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const tr = traps[i]!;
  tr.motion = motionTime(tr, len);
  const tau = Math.min(Math.max(0, t - tr.start), tr.motion);
  const f = len ? Math.min(1, distance(tr, tau) / len) : 1;
  return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1]), a[2] + f * (b[2] - a[2])];
}

function dist(p: ToolheadSample, q: [number, number, number]): number {
  return Math.hypot(p.x - q[0], p.y - q[1], p.z - q[2]);
}

function plan(
  moves: FixtureMove[],
  feeds: [number, number][],
  planner: Planner = klipper,
  edit?: (p: ParsedFile) => void,
) {
  const parsed = fixture(moves, feeds, [], 4);
  edit?.(parsed);
  const timing = planSync(planner, parsed, limits);
  return { parsed, timing };
}

/** Samples every move at 50 instants and checks each against the trapezoid. */
function checkAgainstTrapezoids(parsed: ParsedFile, w: ToolheadWindow, traps: Tr[], skip = new Set<number>()) {
  const out: ToolheadSample = { move: 0, x: 0, y: 0, z: 0, e: 0, tool: 0 };
  for (let i = w.start; i < w.end; i++) {
    if (skip.has(i)) continue;
    const t0 = traps[i]!.start;
    const t1 = i + 1 < traps.length ? traps[i + 1]!.start : w.endTime;
    for (let k = 0; k < 50; k++) {
      const t = t0 + ((t1 - t0) * k) / 50;
      const p = w.positionAt(t, out);
      expect(p).toBe(out);
      if (t1 > t0) expect(p.move).toBe(i); // a zero-time move shares its instant with the next
      expect(dist(p, expected(parsed, traps, i, t))).toBeLessThan(0.01);
    }
  }
}

describe('ToolheadWindow (Klipper trapezoids)', () => {
  it('follows accel, cruise and decel of a long move, and a triangle on a short one', () => {
    const { parsed, timing } = plan(
      [
        { x: 200, y: 0, flags: T, role: MoveRole.None }, // long: accel, cruise at 300, decel
        { x: 200, y: 4, flags: T, role: MoveRole.None }, // 4 mm: too short to reach 300 mm/s
      ],
      [[0, 300]],
    );
    const traps = trapezoidsFor(klipper, parsed, timing, 0, 2);
    expect(traps[0]!.cruise).toBeCloseTo(300, 6);
    expect(traps[1]!.cruise).toBeLessThan(100); // triangle: sqrt(a d) with d about 4 mm
    const w = new ToolheadWindow(klipper, parsed, timing, 0, 2);
    expect(w.profiled).toBe(true);
    expect(w.endTime).toBe(timing.totalTime);
    checkAgainstTrapezoids(parsed, w, traps);
    // Pinned by hand: from rest at 1000 mm/s², 0.1 s in is 5 mm; the end is the end point.
    expect(w.positionAt(0.1).x).toBeCloseTo(5, 6);
    expect(dist(w.positionAt(timing.totalTime), [200, 4, 0])).toBeLessThan(1e-9);
    expect(w.positionAt(-5)).toMatchObject({ move: 0, x: 0, y: 0 });
  });

  it('holds still on a zero-length move and feeds E only on an extrude-only move', () => {
    const { parsed, timing } = plan(
      [
        { x: 10, y: 0, flags: T, role: MoveRole.None },
        { x: 10, y: 0 }, // zero length, no E
        { x: 10, y: 0, e: -2, flags: MoveFlag.Retract },
        { x: 20, y: 0, e: 0.5 },
      ],
      [[0, 100]],
    );
    const traps = trapezoidsFor(klipper, parsed, timing, 0, 4);
    const w = new ToolheadWindow(klipper, parsed, timing, 0, 4);
    checkAgainstTrapezoids(parsed, w, traps, new Set([2]));
    const r0 = traps[2]!.start;
    const r1 = traps[3]!.start;
    const mid = w.positionAt((r0 + r1) / 2);
    expect(mid).toMatchObject({ move: 2, x: 10, y: 0 });
    expect(mid.e).toBeLessThan(0);
    expect(mid.e).toBeGreaterThan(-2);
    expect(w.positionAt(r1 - 1e-9).e).toBeCloseTo(-2, 3);
  });

  it('holds position through a G4, after the move and before the first one', () => {
    const { parsed, timing } = plan(
      [
        { x: 50, y: 0, flags: T, role: MoveRole.None },
        { x: 50, y: 50, flags: T, role: MoveRole.None },
        { x: 0, y: 50, flags: T, role: MoveRole.None },
      ],
      [[0, 200]],
      klipper,
      (p) => {
        p.markers = [
          { name: 'G4', fileOffset: 0, moveIndex: 0, seconds: 1 },
          { name: 'G4', fileOffset: 0, moveIndex: 2, seconds: 3 },
        ];
      },
    );
    const traps = trapezoidsFor(klipper, parsed, timing, 0, 3);
    const w = new ToolheadWindow(klipper, parsed, timing, 0, 3);
    // Before move 0: at the origin for the first second.
    expect(dist(w.positionAt(0.5), [0, 0, 0])).toBe(0);
    expect(dist(w.positionAt(1 + 0.1), [5, 0, 0])).toBeLessThan(0.01);
    // Move 1 stops (G4 flushes), then holds at its end for 3 s until move 2 starts.
    const end1 = traps[1]!.start + motionTime(traps[1]!, 50);
    expect(traps[2]!.start - end1).toBeCloseTo(3, 6);
    for (const t of [end1 + 0.01, end1 + 1.5, traps[2]!.start - 1e-6])
      expect(dist(w.positionAt(t), [50, 50, 0])).toBeLessThan(1e-6);
    checkAgainstTrapezoids(parsed, w, traps, new Set([0]));
  });

  it('keeps the toolhead continuous across a tool change and reports the tool', () => {
    const { parsed, timing } = plan(
      [
        { x: 20, y: 0, e: 1 },
        { x: 20, y: 0, flags: T, role: MoveRole.None }, // T1 here
        { x: 40, y: 10, e: 1 },
      ],
      [[0, 80]],
      klipper,
      (p) => {
        const v = new DataView(p.moves[0]!);
        for (const i of [1, 2]) v.setUint8(i * MOVE_STRIDE + MoveOffset.tool, 1);
      },
    );
    const traps = trapezoidsFor(klipper, parsed, timing, 0, 3);
    const w = new ToolheadWindow(klipper, parsed, timing, 0, 3);
    checkAgainstTrapezoids(parsed, w, traps);
    expect(w.positionAt(traps[0]!.start + 0.01).tool).toBe(0);
    expect(w.positionAt(traps[2]!.start + 0.01).tool).toBe(1);
    expect(dist(w.positionAt(traps[2]!.start), [20, 0, 0])).toBeLessThan(1e-6);
  });

  it('runs an arc along its parser chords, continuous at every chord', () => {
    const r = 10;
    const n = 40;
    const chords: FixtureMove[] = Array.from({ length: n }, (_, k) => {
      const a = (Math.PI * (k + 1)) / n;
      return { x: r * Math.cos(a), y: r * Math.sin(a), e: 0.05, flags: MoveFlag.Arc };
    });
    const { parsed, timing } = plan(
      [{ x: r, y: 0, flags: T, role: MoveRole.None }, ...chords],
      [[0, 60]],
      klipper,
      (p) => {
        // One G2: every chord shares the line's offset.
        p.moves.forEach((buf, b) => {
          const v = new DataView(buf);
          for (let i = 0; i < buf.byteLength / MOVE_STRIDE; i++)
            if (b * 4 + i > 0) v.setUint32(i * MOVE_STRIDE + MoveOffset.fileOffset, 1, true);
        });
      },
    );
    const traps = trapezoidsFor(klipper, parsed, timing, 0, n + 1);
    const w = new ToolheadWindow(klipper, parsed, timing, 0, n + 1);
    for (let i = 1; i <= n; i++) {
      const a = point(parsed, i - 1);
      const b = point(parsed, i);
      expect(dist(w.positionAt(traps[i]!.start), a)).toBeLessThan(0.01);
      const t1 = i < n ? traps[i + 1]!.start : timing.totalTime;
      let last = -1;
      for (let k = 0; k <= 10; k++) {
        const p = w.positionAt(traps[i]!.start + ((t1 - traps[i]!.start) * k) / 10 - (k === 10 ? 1e-9 : 0));
        // On the chord, moving forward along it.
        const along =
          ((p.x - a[0]) * (b[0] - a[0]) + (p.y - a[1]) * (b[1] - a[1])) / Math.hypot(b[0] - a[0], b[1] - a[1]) ** 2;
        const off =
          Math.abs((p.x - a[0]) * (b[1] - a[1]) - (p.y - a[1]) * (b[0] - a[0])) / Math.hypot(b[0] - a[0], b[1] - a[1]);
        expect(off).toBeLessThan(1e-4);
        expect(along).toBeGreaterThanOrEqual(last - 1e-9);
        last = along;
      }
      expect(last).toBeCloseTo(1, 4);
    }
    // Inside the window the arc's mid-time point is on the circle (within a chord's sagitta).
    const p = w.positionAt((traps[1]!.start + timing.totalTime) / 2);
    expect(Math.abs(Math.hypot(p.x, p.y) - r)).toBeLessThan(r * (1 - Math.cos(Math.PI / n / 2)) + 1e-3);
  });

  it('agrees with a window built from any start on a longer file', () => {
    const moves: FixtureMove[] = Array.from({ length: 300 }, (_, i) => ({
      x: (i % 3) * 7 + (i % 5),
      y: (i % 4) * 3,
      e: 0.1,
    }));
    const { parsed, timing } = plan(moves, [[0, 150]]);
    const traps = trapezoidsFor(klipper, parsed, timing, 0, 300);
    const all = new ToolheadWindow(klipper, parsed, timing, 0, 300);
    const part = new ToolheadWindow(klipper, parsed, timing, 120, 180);
    checkAgainstTrapezoids(parsed, part, traps);
    for (let k = 0; k < 200; k++) {
      const t = part.startTime + ((part.endTime - part.startTime) * k) / 200;
      expect(part.positionAt(t)).toEqual(all.positionAt(t));
      expect(moveAtTime(parsed, t)).toBe(part.positionAt(t).move);
    }
  });
});

describe('ToolheadWindow (constant-speed fallback)', () => {
  it('runs each move at constant speed from its start time to the next, holding G4 dwells', () => {
    const { parsed, timing } = plan(
      [
        { x: 10, y: 0, flags: T, role: MoveRole.None },
        { x: 10, y: 20, flags: T, role: MoveRole.None },
      ],
      [[0, 10]],
      constantSpeedPlanner,
      (p) => {
        p.markers = [{ name: 'G4', fileOffset: 0, moveIndex: 1, seconds: 2 }];
      },
    );
    expect(() => trapezoidsFor(constantSpeedPlanner, parsed, timing, 0, 2)).toThrow('cannot resume');
    const w = new ToolheadWindow(constantSpeedPlanner, parsed, timing, 0, 2);
    expect(w.profiled).toBe(false);
    expect(w.positionAt(0.5).x).toBeCloseTo(5, 5); // 10 mm at 10 mm/s
    expect(w.positionAt(1.5)).toMatchObject({ move: 0, x: 10, y: 0 }); // the dwell, 1 s to 3 s
    expect(w.positionAt(2.9).x).toBeCloseTo(10, 5);
    expect(w.positionAt(4).y).toBeCloseTo(10, 4);
    expect(w.positionAt(99)).toMatchObject({ move: 1, x: 10, y: 20 });
    expect(w.endTime).toBe(timing.totalTime);
  });
});

describe('moveAtTime', () => {
  it('finds the last move starting at or before t, across buffers', () => {
    const { parsed } = plan(
      Array.from({ length: 23 }, (_, i) => ({ x: i + 1, y: 0, flags: T, role: MoveRole.None })),
      [[0, 1]],
      constantSpeedPlanner,
    );
    // 1 mm at 1 mm/s each (move 0 from the origin): move i starts at i s.
    expect(moveAtTime(parsed, -1)).toBe(0);
    expect(moveAtTime(parsed, 0)).toBe(0);
    expect(moveAtTime(parsed, 7.5)).toBe(7);
    expect(moveAtTime(parsed, 8)).toBe(8);
    expect(moveAtTime(parsed, 1000)).toBe(22);
    expect(moveAtTime(fixture([], [], []), 1)).toBe(-1);
  });
});

describe('transfer form and the planner-free entry', () => {
  it('round-trips a window exactly', () => {
    const { parsed, timing } = plan(
      [
        { x: 50, y: 0, flags: T, role: MoveRole.None },
        { x: 50, y: 40, flags: T, role: MoveRole.None },
        { x: 0, y: 40 },
      ],
      [[0, 300]],
    );
    const w = new ToolheadWindow(klipper, parsed, timing, 0, 3);
    const t = w.toTransfer();
    const r = ToolheadWindow.fromTransfer(structuredClone(t));
    expect(r.toTransfer()).toEqual(t);
    for (const s of [0, 0.01, 0.05, 0.1, 0.2, 5]) expect(r.positionAt(s)).toEqual(w.positionAt(s));
    expect(() => ToolheadWindow.fromTransfer({ ...t, data: t.data.subarray(1) })).toThrow(RangeError);
  });

  it('src/window.ts loads no planner module (type-only imports are erased)', () => {
    const seen = new Set<string>();
    const walk = (f: string): void => {
      if (seen.has(f)) return;
      seen.add(f);
      for (const m of readFileSync(f, 'utf8').matchAll(/^(?:import|export)\s(?!type\s)[^;]*?from '(\.[^']+)'/gms))
        walk(resolve(dirname(f), m[1]!));
    };
    walk(resolve(import.meta.dirname, '../src/window.ts'));
    const names = [...seen].map((f) => basename(f));
    expect(names).toContain('interp.ts');
    for (const n of ['klipper.ts', 'marlin.ts', 'rrf-planner.ts', 'planner.ts']) expect(names).not.toContain(n);
  });
});
