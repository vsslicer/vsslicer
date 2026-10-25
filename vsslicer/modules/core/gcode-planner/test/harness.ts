// SPDX-License-Identifier: AGPL-3.0-or-later
// The contract every planner passes: run it on a fixture and check the Timing's invariants.
import { expect } from 'vitest';
import {
  MOVE_STRIDE,
  MoveFlag,
  MoveOffset,
  MoveRole,
  STATE_CHANGE_STRIDE,
  StateKind,
  writeMove,
  writeStateChange,
} from '@vsslicer/gcode-api';
import type { Layer, ParsedFile, StateChange } from '@vsslicer/gcode-api';
import { planSync, resolveLimits } from '../src/index.ts';
import type { Flavour, LimitKey, LimitSource, Planner, ResolvedLimits, Timing } from '../src/index.ts';

export interface FixtureMove {
  x: number;
  y: number;
  z?: number;
  e?: number;
  flags?: number;
  role?: number;
}

/**
 * Builds a ParsedFile from moves, cut into buffers of `chunk` moves, with F changes `[moveIndex, mm/s]`
 * and any other state changes in `states`.
 */
export function fixture(
  moves: FixtureMove[],
  feeds: [number, number][],
  layers: Layer[],
  chunk = 3,
  states: StateChange[] = [],
): ParsedFile {
  const changes = [
    ...feeds.map(([moveIndex, value]) => ({ moveIndex, kind: StateKind.Feedrate, index: 0, value })),
    ...states,
  ].sort((a, b) => a.moveIndex - b.moveIndex);
  const parsed: ParsedFile = {
    slicer: 'unknown',
    moveCount: moves.length,
    moves: [],
    extrusion: [],
    stateChanges: [],
    layers,
    markers: [],
    diagnostics: [],
    thumbnails: [],
    objects: [],
    config: {},
  };
  for (let first = 0; first < moves.length; first += chunk) {
    const part = moves.slice(first, first + chunk);
    const buf = new ArrayBuffer(part.length * MOVE_STRIDE);
    const ext = new ArrayBuffer(part.length * 4);
    const v = new DataView(buf);
    part.forEach((m, i) => {
      writeMove(v, i, {
        x: m.x,
        y: m.y,
        z: m.z ?? 0,
        width: 0.4,
        height: 0.2,
        role: (m.role ?? MoveRole.Perimeter) as MoveRole,
        tool: 0,
        flags: m.flags ?? 0,
        fileOffset: first + i,
        startTime: NaN,
      });
      new DataView(ext).setFloat32(i * 4, m.e ?? 0, true);
    });
    parsed.moves.push(buf);
    parsed.extrusion.push(ext);
    const own = changes.filter((c) => c.moveIndex >= first && c.moveIndex < first + chunk);
    const sc = new ArrayBuffer(own.length * STATE_CHANGE_STRIDE);
    own.forEach((c, i) => writeStateChange(new DataView(sc), i, c));
    parsed.stateChanges.push(sc);
  }
  return parsed;
}

/** A small square-ish print: travel, two layers of perimeter and infill, a retract. */
export function sampleFile(chunk = 3): ParsedFile {
  const T = MoveFlag.Travel;
  return fixture(
    [
      { x: 10, y: 0, flags: T, role: MoveRole.None },
      { x: 20, y: 0, e: 0.5 },
      { x: 20, y: 10, e: 0.5, role: MoveRole.InternalInfill },
      { x: 20, y: 10, e: -0.8, flags: MoveFlag.Retract },
      { x: 20, y: 10, z: 0.2, flags: T, role: MoveRole.None },
      { x: 10, y: 10, z: 0.2, e: 0.5 },
      { x: 10, y: 0, z: 0.2, e: 0.5, role: MoveRole.InternalInfill },
    ],
    [
      [0, 100],
      [1, 20],
      [5, 40],
    ],
    [
      { z: 0, firstMove: 1 },
      { z: 0.2, firstMove: 4 },
    ],
    chunk,
  );
}

function startTimes(parsed: ParsedFile): number[] {
  return parsed.moves.flatMap((b) => {
    const v = new DataView(b);
    return Array.from({ length: b.byteLength / MOVE_STRIDE }, (_, i) =>
      v.getFloat32(i * MOVE_STRIDE + MoveOffset.startTime, true),
    );
  });
}

/** Runs `planner` on the sample and checks every invariant of the contract; returns the Timing. */
export function checkPlanner(planner: Planner, parsed = sampleFile()): Timing {
  const limits = resolveLimits({ flavour: 'marlin' });
  const it = planner.plan(parsed, limits);
  let yields = 0;
  let r = it.next();
  for (; !r.done; r = it.next()) yields++;
  const timing = r.value;
  // The contract: at least one yield per non-empty move buffer, so runPlanner can slice and abort.
  expect(yields).toBeGreaterThanOrEqual(parsed.moves.filter((b) => b.byteLength > 0).length);
  expect(timing.planner).toBe(planner.name);
  expect(timing.limits).toBe(limits);

  const t = startTimes(parsed);
  expect(t).toHaveLength(parsed.moveCount);
  expect(t[0]).toBe(0);
  for (let i = 1; i < t.length; i++) expect(t[i]!).toBeGreaterThanOrEqual(t[i - 1]!);
  expect(t.at(-1)!).toBeLessThanOrEqual(Math.fround(timing.totalTime));

  const roles = timing.roleTimes.reduce((a, b) => a + b, 0);
  expect(roles + timing.travelTime).toBeCloseTo(timing.totalTime, 9);
  expect(timing.layerTimes).toHaveLength(parsed.layers.length);
  const preamble = t[parsed.layers[0]?.firstMove ?? parsed.moveCount] ?? timing.totalTime;
  const layers = timing.layerTimes.reduce((a, b) => a + b, 0);
  expect(preamble + layers).toBeCloseTo(timing.totalTime, 4);

  expect(timing.checkpoints.length).toBe(Math.ceil(parsed.moveCount / timing.checkpointInterval));
  timing.checkpoints.forEach((c, i) => {
    expect(c.move).toBe(i * timing.checkpointInterval);
    expect(Math.fround(c.time)).toBe(t[c.move]);
    expect(c.speed).toBeGreaterThanOrEqual(0);
  });
  return timing;
}

export interface PrecedenceCase {
  flavour: Flavour;
  /** A limit the planner reads, and the in-file command that sets it. */
  key: LimitKey;
  kind: StateKind;
  index?: number;
  /** Two values far enough apart, and low enough, to change a 100 mm travel's time. */
  values: [number, number];
}

/**
 * The precedence rule every planner obeys (planner.ts): an override beats the file's own limit
 * command, and the file's command beats a config-block (or default) value.
 */
export function checkLimitPrecedence(
  planner: Planner,
  { flavour, key, kind, index = 0, values: [a, b] }: PrecedenceCase,
): void {
  const time = (source: LimitSource, value: number, inFile?: number): number => {
    const base = resolveLimits({ flavour });
    const limits: ResolvedLimits = {
      ...base,
      limits: { ...base.limits, [key]: value },
      sources: { ...base.sources, [key]: source },
    };
    const states = inFile === undefined ? [] : [{ moveIndex: 0, kind, index, value: inFile }];
    const parsed = fixture([{ x: 100, y: 0, flags: MoveFlag.Travel, role: MoveRole.None }], [[0, 1000]], [], 3, states);
    return planSync(planner, parsed, limits).totalTime;
  };
  expect(time('config', a)).not.toBeCloseTo(time('config', b), 6);
  expect(time('config', a, b)).toBeCloseTo(time('config', b), 9);
  expect(time('override', a, b)).toBeCloseTo(time('override', a), 9);
}
