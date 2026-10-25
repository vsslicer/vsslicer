// SPDX-License-Identifier: AGPL-3.0-or-later
import { MoveFlag, MoveRole, StateKind } from '@vsslicer/gcode-api';
import { describe, expect, it } from 'vitest';
import { GCodeParser } from '../src/domain/parser.ts';
import { encode, run } from './support/run.ts';

const K = StateKind;
const pos = (m: { x: number; y: number; z: number }): number[] => [m.x, m.y, m.z];

describe('G0/G1 moves', () => {
  it('writes absolute positions, tool, role and the line offset', async () => {
    const r = await run('G1 X10 Y20 Z0.3 E1 F1500\nG0 X5\n');
    expect(r.moves).toHaveLength(2);
    expect(pos(r.moves[0]!)).toEqual([10, 20, expect.closeTo(0.3, 5)]);
    expect(pos(r.moves[1]!)).toEqual([5, 20, expect.closeTo(0.3, 5)]);
    expect(r.moves.map((m) => m.fileOffset)).toEqual([0, 25]);
    expect(r.moves[0]).toMatchObject({ role: MoveRole.Unknown, tool: 0, width: 0, height: 0, flags: 0 });
    expect(r.moves[1]!.flags).toBe(MoveFlag.Travel);
    expect(r.moves[1]!.startTime).toBeNaN();
  });
  it('a G1 with only F is a state change, not a move', async () => {
    const r = await run('G1 F3000\nG1 X1\n');
    expect(r.moves).toHaveLength(1);
    expect(r.changes).toEqual([{ moveIndex: 0, kind: K.Feedrate, index: 0, value: 50 }]);
  });
  it('flags retracts and unretracts, and writes the E delta', async () => {
    const r = await run('G1 X1 E1\nG1 E-1\nG1 X2 Y2 E-2\nG1 E0\nG1 E1\n');
    expect(r.e).toEqual([1, -2, -1, 2, 1]);
    expect(r.moves.map((m) => m.flags)).toEqual([
      0,
      MoveFlag.Retract,
      MoveFlag.Travel | MoveFlag.Retract,
      MoveFlag.Unretract,
      MoveFlag.Unretract,
    ]);
  });
  it('tolerates CRLF, N numbers, checksums, comments, lower case and compact words', async () => {
    const r = await run('N5 G1 X1 Y2*71\r\ng1x3y4 ; hi\r\nG1 (c) X5\r\n; only a comment\r\n\r\n');
    expect(r.moves.map((m) => [m.x, m.y])).toEqual([
      [1, 2],
      [3, 4],
      [5, 4],
    ]);
    expect(r.markers).toEqual([]);
  });
});

describe('G90/G91, M82/M83, G92', () => {
  it('G91 makes X/Y/Z relative, G90 absolute again', async () => {
    const r = await run('G1 X10 Y10\nG91\nG1 X5 Y-2\nG1 X5\nG90\nG1 X0\n');
    expect(r.moves.map((m) => [m.x, m.y])).toEqual([
      [10, 10],
      [15, 8],
      [20, 8],
      [0, 8],
    ]);
  });
  it('M82 absolute E, M83 relative E, G92 E resets', async () => {
    const r = await run('M82\nG1 X1 E2\nG1 X2 E5\nG92 E0\nG1 X3 E1\nM83\nG1 X4 E0.5\nG1 X5 E0.5\n');
    expect(r.e).toEqual([2, 3, 1, 0.5, 0.5]);
    expect(r.markers).toEqual([]);
  });
  it('without M82/M83 the extruder follows G90/G91', async () => {
    const r = await run('G1 X1 E1\nG1 X1 E3\nG91\nG1 X1 E1\nG1 X1 E1\nG90\nG1 X1 E5\n');
    expect(r.e).toEqual([1, 2, 1, 1, 0]);
  });
  it('G91 makes E relative even after M82 (PrusaSlicer rule)', async () => {
    const r = await run('M82\nG91\nG1 E-5\nG1 E2\n');
    expect(r.e).toEqual([-5, 2]);
  });
  it('G91 then M82 keeps E relative; G90 brings M82 back into force', async () => {
    const r = await run('G91\nM82\nG1 E1\nG1 E1\nG90\nG1 E5\n');
    expect(r.e).toEqual([1, 1, 3]);
  });
  it('M83 then G90 keeps E relative (Marlin would revert to absolute)', async () => {
    const r = await run('M83\nG90\nG1 X1 E1\nG1 X2 E1\n');
    expect(r.e).toEqual([1, 1]);
  });
  it('G92 shifts the origin and keeps the machine position continuous', async () => {
    const r = await run('G1 X10 Y10\nG92 X0\nG1 X5\nG92\nG1 X1\n');
    expect(r.moves.map((m) => [m.x, m.y])).toEqual([
      [10, 10],
      [15, 10],
      [16, 10],
    ]);
  });
});

describe('UTF-8 BOM', () => {
  it('is skipped at the stream start, also split over 1-byte pieces, and offsets count it', async () => {
    for (const size of [1, 2, 1 << 20]) {
      const r = await run('\ufeffG1 X1\nG1 X2\n', {}, size);
      expect(
        r.moves.map((m) => [m.x, m.fileOffset]),
        `size ${size}`,
      ).toEqual([
        [1, 3],
        [2, 9],
      ]);
    }
  });
});

describe('G10/G11 firmware retract and G17-19', () => {
  it('G10/G11 are in-place moves with a flag and zero E; with P or L they are markers', async () => {
    const r = await run('G1 X3 Y4 E1\nG10\nG11\nG10 P1 X5\nG10 L2 P1\n');
    expect(r.moves.map((m) => [m.x, m.y, m.flags])).toEqual([
      [3, 4, 0],
      [3, 4, MoveFlag.Retract],
      [3, 4, MoveFlag.Unretract],
    ]);
    expect(r.e).toEqual([1, 0, 0]);
    expect(r.markers.map((m) => m.name)).toEqual(['G10', 'G10']);
  });
  it('tracks the arc plane', () => {
    const p = new GCodeParser();
    expect(p.machine.plane).toBe(17);
    for (const _ of p.feed(encode('G18\n'))) void _;
    expect(p.machine.plane).toBe(18);
    for (const _ of p.feed(encode('G19\nG17\nG19\n'))) void _;
    expect(p.machine.plane).toBe(19);
  });
});

describe('tool changes', () => {
  it('T<n> sets the tool of later moves and is a state change; T0 at the start is not', async () => {
    const r = await run('T0\nG1 X1\nT1\nG1 X2\nT1\nT0\nG1 X3\n');
    expect(r.moves.map((m) => m.tool)).toEqual([0, 1, 0]);
    expect(r.changes).toEqual([
      { moveIndex: 1, kind: K.ToolChange, index: 0, value: 1 },
      { moveIndex: 2, kind: K.ToolChange, index: 0, value: 0 },
    ]);
    expect(r.markers).toEqual([]);
  });
  it('a tool number a byte cannot hold stays a marker', async () => {
    const r = await run('T1000\n');
    expect(r.markers.map((m) => m.name)).toEqual(['T1000']);
  });
});

/** command line -> state changes it must produce (moveIndex 0 as no move precedes). */
const cases: [string, string, { kind: StateKind; index?: number; value: number }[], Record<string, unknown>?][] = [
  ['M104', 'M104 S215', [{ kind: K.HotendTemp, value: 215 }]],
  [
    'M104 T',
    'T1\nM104 S200 T0',
    [
      { kind: K.ToolChange, value: 1 },
      { kind: K.HotendTemp, value: 200 },
    ],
  ],
  [
    'M109 uses the active tool',
    'T2\nM109 S210',
    [
      { kind: K.ToolChange, value: 2 },
      { kind: K.HotendTemp, index: 2, value: 210 },
    ],
  ],
  ['M109 R', 'M109 R190', [{ kind: K.HotendTemp, value: 190 }]],
  ['M140', 'M140 S60', [{ kind: K.BedTemp, value: 60 }]],
  ['M190', 'M190 S65', [{ kind: K.BedTemp, value: 65 }]],
  ['M106', 'M106 S128', [{ kind: K.Fan, value: 128 / 255 }]],
  ['M106 P', 'M106 P1 S255', [{ kind: K.Fan, index: 1, value: 1 }]],
  ['M106 without S is full', 'M106', [{ kind: K.Fan, value: 1 }]],
  [
    'M107',
    'M106 S255\nM107',
    [
      { kind: K.Fan, value: 1 },
      { kind: K.Fan, value: 0 },
    ],
  ],
  ['M106 RRF fraction', 'M106 S0.5', [{ kind: K.Fan, value: 0.5 }], { flavour: 'reprapfirmware' }],
  ['M204 S', 'M204 S3000', [{ kind: K.Accel, value: 3000 }]],
  [
    'M204 P R T',
    'M204 P2000 R1500 T4000',
    [
      { kind: K.AccelPrint, value: 2000 },
      { kind: K.AccelRetract, value: 1500 },
      { kind: K.AccelTravel, value: 4000 },
    ],
  ],
  [
    'M201',
    'M201 X9000 Y8000 E5000',
    [
      { kind: K.MaxAccel, index: 0, value: 9000 },
      { kind: K.MaxAccel, index: 1, value: 8000 },
      { kind: K.MaxAccel, index: 3, value: 5000 },
    ],
  ],
  [
    'M203 Marlin mm/s',
    'M203 X500 Z12',
    [
      { kind: K.MaxFeedrate, index: 0, value: 500 },
      { kind: K.MaxFeedrate, index: 2, value: 12 },
    ],
  ],
  [
    'M203 RRF mm/min',
    'M203 X30000 E3600',
    [
      { kind: K.MaxFeedrate, index: 0, value: 500 },
      { kind: K.MaxFeedrate, index: 3, value: 60 },
    ],
    { flavour: 'reprapfirmware' },
  ],
  [
    'M205 jerk',
    'M205 X8 Y9 Z0.4 E5',
    [
      { kind: K.Jerk, index: 0, value: 8 },
      { kind: K.Jerk, index: 1, value: 9 },
      { kind: K.Jerk, index: 2, value: 0.4 },
      { kind: K.Jerk, index: 3, value: 5 },
    ],
  ],
  [
    'M205 J S T',
    'M205 J0.02 S0 T0.5',
    [
      { kind: K.JunctionDeviation, value: 0.02 },
      { kind: K.MinFeedrate, value: 0 },
      { kind: K.MinTravelFeedrate, value: 0.5 },
    ],
  ],
  [
    'M566 RRF mm/min',
    'M566 X600 Z24',
    [
      { kind: K.Jerk, index: 0, value: 10 },
      { kind: K.Jerk, index: 2, value: 0.4 },
    ],
    { flavour: 'reprapfirmware' },
  ],
  ['M900', 'M900 K0.05', [{ kind: K.PressureAdvance, value: 0.05 }]],
  ['M900 T', 'M900 K0.04 T1', [{ kind: K.PressureAdvance, index: 1, value: 0.04 }]],
  ['M572', 'M572 D1 S0.06', [{ kind: K.PressureAdvance, index: 1, value: 0.06 }]],
  [
    'SET_VELOCITY_LIMIT',
    'SET_VELOCITY_LIMIT VELOCITY=300 ACCEL=5000 ACCEL_TO_DECEL=2500 SQUARE_CORNER_VELOCITY=6 MINIMUM_CRUISE_RATIO=0.5',
    [
      { kind: K.MaxVelocity, value: 300 },
      { kind: K.Accel, value: 5000 },
      { kind: K.AccelToDecel, value: 2500 },
      { kind: K.MinCruiseRatio, value: 0.5 },
      { kind: K.SquareCornerVelocity, value: 6 },
    ],
  ],
  [
    'SET_PRESSURE_ADVANCE',
    'set_pressure_advance advance=0.03 smooth_time=0.04',
    [
      { kind: K.PressureAdvance, value: 0.03 },
      { kind: K.PressureAdvanceSmoothTime, value: 0.04 },
    ],
  ],
  [
    'SET_PRESSURE_ADVANCE EXTRUDER maps extruder<n> to n',
    'SET_PRESSURE_ADVANCE EXTRUDER=extruder1 ADVANCE=0.05\nSET_PRESSURE_ADVANCE EXTRUDER=extruder ADVANCE=0.06',
    [
      { kind: K.PressureAdvance, index: 1, value: 0.05 },
      { kind: K.PressureAdvance, index: 0, value: 0.06 },
    ],
  ],
];

describe('state-change commands', () => {
  it.each(cases)('%s', async (_name, text, expected, opts) => {
    const r = await run(`${text}\n`, opts);
    expect(r.changes).toEqual(
      expected.map((c) => ({ moveIndex: 0, kind: c.kind, index: c.index ?? 0, value: expect.closeTo(c.value, 5) })),
    );
    expect(r.markers).toEqual([]);
    expect(r.diagnostics).toEqual([]);
  });

  it('stores only changed values, for every kind', async () => {
    const r = await run(
      'G1 F3000\nG1 X1 F3000\nM106 S255\nM106 S255\nM104 S200\nM104 S200\nM104 S210\nG1 X2 F6000\nG1 X3 F3000\n',
    );
    expect(r.changes.map((c) => [c.moveIndex, c.kind, c.value])).toEqual([
      [0, K.Feedrate, 50],
      [1, K.Fan, 1],
      [1, K.HotendTemp, 200],
      [1, K.HotendTemp, 210],
      [1, K.Feedrate, 100],
      [2, K.Feedrate, 50],
    ]);
  });
  it('a change on its own line gets the next move index; on a move line, that move', async () => {
    const r = await run('G1 X1\nM140 S60\nG1 X2 F600\nM104 S200\n');
    expect(r.changes.map((c) => [c.moveIndex, c.kind])).toEqual([
      [1, K.BedTemp],
      [1, K.Feedrate],
      [2, K.HotendTemp],
    ]);
  });
  it('an unknown extruder name is a warning and changes nothing', async () => {
    const r = await run('SET_PRESSURE_ADVANCE EXTRUDER=left ADVANCE=0.1\n');
    expect(r.changes).toEqual([]);
    expect(r.diagnostics.map((d) => d.code)).toEqual(['unknown-extruder']);
  });
});

describe('markers', () => {
  it('keeps unknown and out-of-scope commands as named markers with offset and next move', async () => {
    const r = await run('G1 X1\nM486 S1 Acube\nG4 P200\nexclude_object_start NAME=a\nG28\nM600\nG92.1\nG1 X2\n');
    expect(r.markers).toEqual([
      { name: 'M486', fileOffset: 6, moveIndex: 1 },
      { name: 'G4', fileOffset: 20, moveIndex: 1 },
      { name: 'EXCLUDE_OBJECT_START', fileOffset: 28, moveIndex: 1 },
      { name: 'G28', fileOffset: 56, moveIndex: 1 },
      { name: 'M600', fileOffset: 60, moveIndex: 1 },
      { name: 'G92.1', fileOffset: 65, moveIndex: 1 },
    ]);
    expect(r.moves).toHaveLength(2);
  });
  it('interpreted modal commands are never markers; G21 is a silent no-op', async () => {
    const r = await run('G21\nG90\nM82\nG92 E0\nM104 S1\nM106 S1\nT0\nG17\n');
    expect(r.markers).toEqual([]);
  });
});
