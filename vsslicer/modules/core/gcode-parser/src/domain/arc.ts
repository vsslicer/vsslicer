// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Plane } from './machine.ts';

/**
 * G2/G3 arc geometry: the centre from I/J/K or R, the sweep, and the vertices of a polyline that
 * stays within a chord tolerance of the arc. Pure; the machine calls it and writes the moves.
 *
 * Ported from Marlin@2ef3ee6:Marlin/src/gcode/motion/G2_G3.cpp:55-135 (plan_arc: planes, full circle
 * when start and end coincide in the plane, sweeps over 180 degrees going the other way round) and
 * :425-445 (G2_G3: R-form centre, negative R = the long way round). GPL-3.0-or-later.
 * Copyright (c) 2020 MarlinFirmware [https://github.com/MarlinFirmware/Marlin], based on Sprinter and
 * grbl, Copyright (c) 2011 Camiel Gubbels / Erik van der Zalm.
 * Differences: Marlin cuts a fixed MM_PER_ARC_SEGMENT (1 mm) segments; here the segment angle follows
 * the chord tolerance, as PrusaSlicer's libpgcode does (PrusaSlicer@30ef591
 * src/libpgcode/src/Slic3r/Biz/libpgcode/ProcessorImpl.cpp:1120-1206, AGPL-3.0, Copyright (c) Prusa
 * Research and the Slic3r/PrusaSlicer contributors). Marlin accepts an R too small for the chord and
 * an end point off the circle; we report both.
 */

/** Plane axes (0 X, 1 Y, 2 Z): arc in (p, q), helical travel along l. I/J/K are the offsets of X/Y/Z. */
const PLANES: Record<Plane, { p: number; q: number; l: number }> = {
  17: { p: 0, q: 1, l: 2 }, // G17 XY
  18: { p: 2, q: 0, l: 1 }, // G18 ZX: Z first, so G2 is clockwise seen from +Y (Marlin PLANE_ZX)
  19: { p: 1, q: 2, l: 0 }, // G19 YZ
};

/** Start and end closer than this in the plane (mm) is a full circle. */
const NEAR = 1e-4;
/** Hard cap on the segments of one arc, so a tiny tolerance cannot allocate without bound. */
export const MAX_ARC_SEGMENTS = 16384;

export interface ArcInput {
  readonly start: readonly number[];
  readonly end: readonly number[];
  readonly plane: Plane;
  /** I, J, K as written (offsets from the start to the centre, always relative); NaN when absent. */
  readonly ijk: readonly [number, number, number];
  /** R as written; NaN when absent. Wins over I/J/K, as in Marlin. */
  readonly radius: number;
  readonly clockwise: boolean;
  /** Largest distance (mm) between the arc and a chord. Also the slack for radius mismatches. */
  readonly tolerance: number;
  /** Largest angle (radians) one segment may sweep. */
  readonly maxAngle: number;
}

export type ArcResult =
  { readonly ok: true; readonly points: Float64Array } | { readonly ok: false; readonly error: string };

const fail = (error: string): ArcResult => ({ ok: false, error });

/**
 * Vertices after the start up to and including the end, as x, y, z triples. The last vertex is the
 * end point exactly; the others lie on the circle of the start radius. The linear axis is
 * interpolated evenly, so every segment has the same length and E can be split evenly.
 */
export function tessellateArc(a: ArcInput): ArcResult {
  const { p, q, l } = PLANES[a.plane];
  const sp = a.start[p] ?? 0;
  const sq = a.start[q] ?? 0;
  const dp = (a.end[p] ?? 0) - sp;
  const dq = (a.end[q] ?? 0) - sq;
  const full = Math.abs(dp) < NEAR && Math.abs(dq) < NEAR;

  let cp: number; // centre relative to the start
  let cq: number;
  if (!Number.isNaN(a.radius)) {
    if (full) return fail('R-form arc starts and ends at the same point; a full circle needs I/J');
    const r = a.radius;
    const len = Math.hypot(dp, dq) / 2;
    if (Math.abs(r) < len - a.tolerance) return fail(`radius ${r} is too small for a chord of ${2 * len}`);
    const h = Math.sqrt(Math.max(0, (r - len) * (r + len))); // centre's distance from the chord's midpoint
    const side = a.clockwise !== r < 0 ? -1 : 1;
    cp = dp / 2 + (-dq / 2 / len) * side * h;
    cq = dq / 2 + (dp / 2 / len) * side * h;
  } else {
    const ip = a.ijk[p] ?? NaN;
    const iq = a.ijk[q] ?? NaN;
    if (Number.isNaN(ip) && Number.isNaN(iq)) return fail('no centre offset (I/J/K) or radius (R) in the arc plane');
    cp = Number.isNaN(ip) ? 0 : ip;
    cq = Number.isNaN(iq) ? 0 : iq;
  }

  const radius = Math.hypot(cp, cq);
  if (radius < 1e-9) return fail('arc radius is zero');
  const endRadius = Math.hypot(dp - cp, dq - cq);
  if (Math.abs(radius - endRadius) > a.tolerance)
    return fail(`start radius ${radius} and end radius ${endRadius} differ by more than ${a.tolerance}`);

  // Signed sweep, counter-clockwise positive, from the start to the end as seen from the centre.
  const rp = -cp;
  const rq = -cq;
  const ep = dp - cp;
  const eq = dq - cq;
  let sweep = full ? 2 * Math.PI : Math.atan2(rp * eq - rq * ep, rp * ep + rq * eq);
  if (full) sweep = a.clockwise ? -sweep : sweep;
  else if (a.clockwise && sweep > 0) sweep -= 2 * Math.PI;
  else if (!a.clockwise && sweep < 0) sweep += 2 * Math.PI;

  const chordAngle = a.tolerance < radius ? 2 * Math.acos(1 - a.tolerance / radius) : Math.PI;
  const step = Math.min(chordAngle, a.maxAngle);
  const n = Math.min(MAX_ARC_SEGMENTS, Math.max(1, Math.ceil(Math.abs(sweep) / step)));

  const sl = a.start[l] ?? 0;
  const dl = (a.end[l] ?? 0) - sl;
  const points = new Float64Array(n * 3);
  for (let i = 1; i <= n; i++) {
    const last = i === n;
    const angle = (sweep * i) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const at = (i - 1) * 3;
    points[at + p] = last ? sp + dp : sp + cp + rp * cos - rq * sin;
    points[at + q] = last ? sq + dq : sq + cq + rp * sin + rq * cos;
    points[at + l] = last ? sl + dl : sl + (dl * i) / n;
  }
  return { ok: true, points };
}
