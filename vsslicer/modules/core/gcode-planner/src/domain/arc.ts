// SPDX-License-Identifier: AGPL-3.0-or-later
// Follows klipper@ee2c6fb:klippy/extras/gcode_arcs.py:100-175 (GPL-3.0-or-later, combined here under AGPL-3.0 per D2).

/** X, Y, Z and the running E total. */
export type ArcPoint = [number, number, number, number];

const sq = (x: number) => x * x;

/** Circle centre through three XY points, or undefined when they are collinear. */
function centre(a: ArcPoint, b: ArcPoint, c: ArcPoint): [number, number] | undefined {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-9) return undefined;
  const a2 = sq(a[0]) + sq(a[1]);
  const b2 = sq(b[0]) + sq(b[1]);
  const c2 = sq(c[0]) + sq(c[1]);
  return [
    (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d,
    (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d,
  ];
}

/** The circle through an arc's chords: centre `c`, radius, swept angle (rad), direction (+1 CCW) and start angle. */
export interface ArcFit {
  c: [number, number];
  r: number;
  angle: number;
  dir: number;
  a0: number;
}

/** Fits a circle to the chords of one arc (`points`: start first), or `undefined` when they are one chord or collinear. */
export function fitArc(points: ArcPoint[]): ArcFit | undefined {
  const n = points.length - 1;
  const p0 = points[0]!;
  const c =
    n >= 2 ? centre(p0, points[Math.floor(n / 3) || 1]!, points[Math.max(Math.floor((2 * n) / 3), 2)]!) : undefined;
  if (!c) return undefined;
  const r = Math.hypot(p0[0] - c[0], p0[1] - c[1]);
  let angle = 0;
  for (let i = 1; i <= n; i++) {
    const [a, b] = [points[i - 1]!, points[i]!];
    angle += 2 * Math.asin(Math.min(1, Math.hypot(b[0] - a[0], b[1] - a[1]) / (2 * r)));
  }
  const p1 = points[1]!;
  const dir = Math.sign((p0[0] - c[0]) * (p1[1] - c[1]) - (p0[1] - c[1]) * (p1[0] - c[0])) || 1;
  return { c, r, angle, dir, a0: Math.atan2(p0[1] - c[1], p0[0] - c[0]) };
}

/** The point `f` (0..1) of the way round the fitted arc from `p0` to `pn`, Z and E spread evenly. */
export function arcPoint(fit: ArcFit, p0: ArcPoint, pn: ArcPoint, f: number): ArcPoint {
  const a = fit.a0 + fit.dir * fit.angle * f;
  return [
    fit.c[0] + fit.r * Math.cos(a),
    fit.c[1] + fit.r * Math.sin(a),
    p0[2] + (pn[2] - p0[2]) * f,
    p0[3] + (pn[3] - p0[3]) * f,
  ];
}

/**
 * Re-cuts the parser's chords of one arc (`points`: start first) the way Klipper's `[gcode_arcs]`
 * does: `max(1, floor(arc length / resolution))` equal segments of the same circle, with Z and E
 * spread evenly and the last one ending on the arc's end. Returns the segments' end points, or
 * `undefined` when the chords do not fit a circle, in which case the chords stand.
 */
export function resegmentArc(points: ArcPoint[], resolution: number): ArcPoint[] | undefined {
  const fit = fitArc(points);
  if (!fit) return undefined;
  const p0 = points[0]!;
  const pn = points[points.length - 1]!;
  const segments = Math.max(1, Math.floor(Math.hypot(fit.r * fit.angle, pn[2] - p0[2]) / resolution));
  const out: ArcPoint[] = [];
  for (let i = 1; i <= segments; i++) out.push(i === segments ? pn : arcPoint(fit, p0, pn, i / segments));
  return out;
}
