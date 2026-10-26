// SPDX-License-Identifier: AGPL-3.0-or-later
// A deliberately tiny G-code reader for the oracle test: just the commands both klipper_estimator and
// our planner time (G0/G1, G90/G91, M82/M83, G92, M204), so the module needs no parser dependency.
import {
  MoveRole,
  MOVE_STRIDE,
  STATE_CHANGE_STRIDE,
  StateKind,
  writeMove,
  writeStateChange,
} from '@vsslicer/gcode-api';
import type { Marker, ParsedFile, StateChange } from '@vsslicer/gcode-api';

export const MAX_GCODE_LINES = 2_000_000;

export function gcodeToParsed(text: string): ParsedFile {
  const lines = text.split('\n');
  if (lines.length > MAX_GCODE_LINES) throw new RangeError(`more than ${MAX_GCODE_LINES} lines`);
  const pos = { x: 0, y: 0, z: 0, e: 0 };
  let absXYZ = true;
  let absE = true; // Klipper's default; klipper_estimator assumes relative only when the file says nothing, and the corpus files say M82/M83.
  const moves: { x: number; y: number; z: number; e: number }[] = [];
  const changes: StateChange[] = [];
  const markers: Marker[] = [];
  for (const raw of lines) {
    const line = raw.split(';')[0]!.trim().toUpperCase();
    if (!line) continue;
    const [cmd, ...words] = line.split(/\s+/);
    const w = (k: string): number | undefined => {
      const t = words.find((x) => x[0] === k);
      return t === undefined ? undefined : Number(t.slice(1));
    };
    const moveIndex = moves.length;
    if (cmd === 'G0' || cmd === 'G1') {
      const f = w('F');
      if (f !== undefined) changes.push({ moveIndex, kind: StateKind.Feedrate, index: 0, value: f / 60 });
      const next = { ...pos };
      let e = 0;
      for (const k of ['X', 'Y', 'Z'] as const) {
        const v = w(k);
        const key = k.toLowerCase() as 'x' | 'y' | 'z';
        if (v !== undefined) next[key] = absXYZ ? v : pos[key] + v;
      }
      const ev = w('E');
      if (ev !== undefined) {
        e = absE ? ev - pos.e : ev;
        next.e = absE ? ev : pos.e + ev;
      }
      if (next.x !== pos.x || next.y !== pos.y || next.z !== pos.z || e !== 0) moves.push({ ...next, e });
      Object.assign(pos, next);
    } else if (cmd === 'G90') absXYZ = true;
    else if (cmd === 'G91') absXYZ = false;
    else if (cmd === 'M82') absE = true;
    else if (cmd === 'M83') absE = false;
    else if (cmd === 'G92') {
      for (const k of ['X', 'Y', 'Z', 'E'] as const) {
        const v = w(k);
        if (v !== undefined) pos[k.toLowerCase() as 'x' | 'y' | 'z' | 'e'] = v;
      }
    } else if (cmd === 'G4' || cmd === 'G28' || cmd === 'M109' || cmd === 'M190' || cmd === 'M600') {
      // klipper_estimator@dbcff4a:lib/src/planner.rs:195-232: G4 waits P ms (0.25 s without P); the others count 0.1 s.
      const seconds = cmd === 'G4' ? (w('P') === undefined ? 0.25 : w('P')! / 1000) : 0.1;
      markers.push({ name: 'ESTIMATOR_ADD_TIME', fileOffset: 0, moveIndex, seconds });
    } else if (cmd === 'M204') {
      const s = w('S');
      const p = w('P');
      const t = w('T');
      // klipper_estimator@dbcff4a:lib/src/planner.rs:127-133: S wins; else P and T together set min(P, T).
      const a = s ?? (p !== undefined && t !== undefined ? Math.min(p, t) : undefined);
      if (a !== undefined) changes.push({ moveIndex, kind: StateKind.Accel, index: 0, value: a });
    }
  }
  const buf = new ArrayBuffer(moves.length * MOVE_STRIDE);
  const ext = new ArrayBuffer(moves.length * 4);
  const v = new DataView(buf);
  moves.forEach((m, i) => {
    writeMove(v, i, {
      x: m.x,
      y: m.y,
      z: m.z,
      width: 0.4,
      height: 0.2,
      role: MoveRole.Perimeter,
      tool: 0,
      flags: 0,
      fileOffset: i,
      startTime: NaN,
    });
    new DataView(ext).setFloat32(i * 4, m.e, true);
  });
  const sc = new ArrayBuffer(changes.length * STATE_CHANGE_STRIDE);
  changes.forEach((c, i) => writeStateChange(new DataView(sc), i, c));
  return {
    slicer: 'unknown',
    moveCount: moves.length,
    moves: [buf],
    extrusion: [ext],
    stateChanges: [sc],
    layers: [],
    markers,
    diagnostics: [],
    thumbnails: [],
    objects: [],
    config: {},
  };
}
