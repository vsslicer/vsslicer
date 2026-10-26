// SPDX-License-Identifier: AGPL-3.0-or-later
// A seeded random print for property tests and the GCP-23 spacing spike: curves, long lines,
// travels, retracts (E and G10/G11), dropped moves, arcs, feed and accel changes, dwells, layers.
import {
  MOVE_STRIDE,
  MoveFlag,
  MoveRole,
  STATE_CHANGE_STRIDE,
  StateKind,
  writeMove,
  writeStateChange,
} from '@vsslicer/gcode-api';
import type { Layer, Marker, ParsedFile, StateChange } from '@vsslicer/gcode-api';

/** mulberry32: a small seeded PRNG, uniform in [0, 1). */
export function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Rec {
  x: number;
  y: number;
  z: number;
  e: number;
  flags: number;
  role: MoveRole;
  offset: number;
}

/** About `count` moves (an arc may run a few over), cut into buffers of `chunk` moves. */
export function randomFile(seed: number, count: number, chunk = 4096): ParsedFile {
  const r = rng(seed);
  const pick = (lo: number, hi: number): number => lo + (hi - lo) * r();
  const moves: Rec[] = [];
  const states: StateChange[] = [];
  const markers: Marker[] = [];
  const layers: Layer[] = [];
  let x = 100;
  let y = 100;
  let z = 0.2;
  let dir = 0;
  let arcs = 0;
  const push = (m: Partial<Rec>): void => {
    moves.push({ x, y, z, e: 0, flags: 0, role: MoveRole.Perimeter, offset: moves.length, ...m });
  };
  const step = (len: number): void => {
    x = Math.min(250, Math.max(0, x + len * Math.cos(dir)));
    y = Math.min(250, Math.max(0, y + len * Math.sin(dir)));
  };
  const state = (kind: StateKind, value: number): void => {
    states.push({ moveIndex: moves.length, kind, index: 0, value });
  };
  state(StateKind.Feedrate, 100);
  while (moves.length < count) {
    const i = moves.length;
    if (i % 500 === 0) layers.push({ z, firstMove: i });
    if (r() < 0.05) state(StateKind.Feedrate, pick(20, 300));
    if (r() < 0.002) state(StateKind.Accel, pick(500, 5000));
    if (r() < 0.001) state(StateKind.SquareCornerVelocity, pick(2, 10));
    if (r() < 0.001) state(StateKind.MaxVelocity, pick(100, 500));
    if (r() < 0.0005) markers.push({ name: 'G4', fileOffset: 0, moveIndex: i, seconds: pick(0, 2) });
    if (r() < 0.0005) markers.push({ name: 'M400', fileOffset: 0, moveIndex: i });
    const k = r();
    if (k < 0.55) {
      dir += pick(-0.4, 0.4);
      const len = pick(0.2, 3);
      step(len);
      push({ e: len * 0.03 });
    } else if (k < 0.7) {
      dir = pick(0, 2 * Math.PI);
      const len = pick(5, 50);
      step(len);
      push({ e: len * 0.03, role: MoveRole.InternalInfill });
    } else if (k < 0.8) {
      dir = pick(0, 2 * Math.PI);
      step(pick(5, 80));
      push({ flags: MoveFlag.Travel, role: MoveRole.None });
    } else if (k < 0.84) push({ e: -0.8, flags: MoveFlag.Retract, role: MoveRole.None });
    else if (k < 0.87) push({ e: 0.8, flags: MoveFlag.Unretract, role: MoveRole.None });
    else if (k < 0.89) push({ flags: r() < 0.5 ? MoveFlag.Retract : MoveFlag.Unretract, role: MoveRole.None });
    else if (k < 0.91) push({});
    else if (k < 0.94) {
      z += r() < 0.5 ? 0.2 : -0.2;
      z = Math.max(0.2, z);
      push({ flags: MoveFlag.Travel, role: MoveRole.None });
    } else {
      // An arc: chords on one circle sharing a file offset.
      const radius = pick(2, 20);
      const cx = x - radius * Math.cos(dir);
      const cy = y - radius * Math.sin(dir);
      const n = Math.floor(pick(5, 30));
      const sweep = pick(0.3, 3) * (r() < 0.5 ? 1 : -1);
      const offset = 2_000_000_000 + arcs++;
      for (let j = 1; j <= n; j++) {
        const a = dir + (sweep * j) / n;
        x = cx + radius * Math.cos(a);
        y = cy + radius * Math.sin(a);
        push({ e: 0.02, flags: MoveFlag.Arc, offset });
      }
      dir += sweep;
    }
  }
  const parsed: ParsedFile = {
    slicer: 'unknown',
    moveCount: moves.length,
    moves: [],
    extrusion: [],
    stateChanges: [],
    layers,
    markers,
    diagnostics: [],
    thumbnails: [],
    objects: [],
    config: {},
  };
  let s = 0;
  for (let first = 0; first < moves.length; first += chunk) {
    const part = moves.slice(first, first + chunk);
    const v = new DataView(new ArrayBuffer(part.length * MOVE_STRIDE));
    const ext = new DataView(new ArrayBuffer(part.length * 4));
    part.forEach((m, i) => {
      writeMove(v, i, {
        x: m.x,
        y: m.y,
        z: m.z,
        width: 0.4,
        height: 0.2,
        role: m.role,
        tool: 0,
        flags: m.flags,
        fileOffset: m.offset,
        startTime: NaN,
      });
      ext.setFloat32(i * 4, m.e, true);
    });
    parsed.moves.push(v.buffer);
    parsed.extrusion.push(ext.buffer);
    const own: StateChange[] = [];
    while (s < states.length && states[s]!.moveIndex < first + chunk) own.push(states[s++]!);
    const sc = new DataView(new ArrayBuffer(own.length * STATE_CHANGE_STRIDE));
    own.forEach((c, i) => writeStateChange(sc, i, c));
    parsed.stateChanges.push(sc.buffer);
  }
  return parsed;
}
