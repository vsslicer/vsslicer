// SPDX-License-Identifier: AGPL-3.0-or-later
import { MoveFlag, StateKind } from '@vsslicer/gcode-api';
import type { ChunkWriter } from './chunk-writer.ts';
import type { Tokens } from './tokeniser.ts';

/**
 * Firmware dialect, for the few commands whose units differ: RepRapFirmware's M203 and M566 are
 * in mm/min and M106 `S` is 0..1 or 0..255, Marlin's and Klipper's M203 is mm/s.
 */
export type Flavour = 'marlin' | 'klipper' | 'reprapfirmware';

export type Plane = 17 | 18 | 19;

/** The modal state the commands act on. Read-only for callers; the machine changes it. */
export interface ModalState {
  /** Machine position of the toolhead, mm (the file's coordinates plus the G92 origin). */
  readonly position: readonly [number, number, number];
  /** G91: X, Y and Z are relative. */
  readonly relative: boolean;
  /** M82 / M83 if given, else follows G90 / G91 (Marlin). */
  readonly extruderRelative: boolean;
  /** Active tool, T0 = 0. */
  readonly tool: number;
  /** G17 (XY), G18 (XZ) or G19 (YZ), used by arcs. */
  readonly plane: Plane;
}

const AXES = ['X', 'Y', 'Z', 'E'] as const;
const MAX_TOOL = 254;

/**
 * The modal state machine and the command handlers. Feed it one tokenised line at a time; it
 * writes moves and state changes into the `ChunkWriter` and keeps everything else as markers.
 * Semantics of G92 (a position offset that keeps the machine position continuous) follow
 * PrusaSlicer GCodeProcessor::process_G92 (PrusaSlicer-2.9@b028299
 * src/libslic3r/GCode/GCodeProcessor.cpp:3424, AGPL-3.0).
 */
export class Machine implements ModalState {
  readonly position: [number, number, number] = [0, 0, 0];
  relative = false;
  tool = 0;
  plane: Plane = 17;
  /** Set by M82/M83. G91 wins over it (PrusaSlicer GCodeProcessor.cpp ~3133). */
  private eRelative = false;
  private readonly origin = [0, 0, 0];
  private ePosition = 0;

  private readonly out: ChunkWriter;
  /** Firmware dialect; the parser sets it when the file names its flavour and no option fixed it. */
  flavour: Flavour;

  constructor(out: ChunkWriter, flavour: Flavour) {
    this.out = out;
    this.flavour = flavour;
  }

  get extruderRelative(): boolean {
    return this.relative || this.eRelative;
  }

  handle(t: Tokens, fileOffset: number): void {
    const n = t.number;
    switch (t.letter) {
      case 0x47: // G
        switch (n) {
          case 0:
          case 1:
            return this.move(t, fileOffset, false);
          case 2:
          case 3:
            return this.move(t, fileOffset, true);
          case 10:
          case 11:
            if (t.hasParam('P') || t.hasParam('L')) return this.out.marker(t.commandName(), fileOffset); // RRF tool offsets
            return this.firmwareRetract(n === 10, fileOffset);
          case 17:
          case 18:
          case 19:
            this.plane = n as Plane;
            return;
          case 21: // millimetres: the only unit; nothing to record
            return;
          case 90:
          case 91:
            this.relative = n === 91;
            return;
          case 92:
            return this.setPosition(t);
        }
        break;
      case 0x4d: // M
        if (this.mCommand(t, n)) return;
        break;
      case 0x54: // T
        if (Number.isInteger(n) && n >= 0 && n <= MAX_TOOL) {
          this.tool = n;
          return this.out.change(StateKind.ToolChange, 0, n);
        }
        break;
      case 0:
        if (this.extended(t, fileOffset)) return;
        break;
    }
    this.out.marker(t.commandName(), fileOffset);
  }

  private move(t: Tokens, fileOffset: number, arc: boolean): void {
    if (t.hasParam('F')) this.feedrate(t.param('F'));
    const axes = t.hasParam('X') || t.hasParam('Y') || t.hasParam('Z');
    if (!axes && !t.hasParam('E')) return;
    let moved = false;
    for (let a = 0; a < 3; a++) {
      const letter = AXES[a] ?? 'X';
      if (!t.hasParam(letter)) continue;
      const v = t.param(letter);
      const target = this.relative ? (this.position[a] ?? 0) + v : (this.origin[a] ?? 0) + v;
      if (target !== this.position[a]) moved = true;
      this.position[a] = target;
    }
    let e = 0;
    if (t.hasParam('E')) {
      const v = t.param('E');
      if (this.extruderRelative) {
        e = v;
        this.ePosition += v; // firmware keeps the absolute E in step
      } else {
        e = v - this.ePosition;
        this.ePosition = v;
      }
    }
    let flags = 0;
    if (e < 0) flags = moved ? MoveFlag.Travel | MoveFlag.Retract : MoveFlag.Retract;
    else if (e === 0) flags = MoveFlag.Travel;
    else if (!moved && !arc) flags = MoveFlag.Unretract;
    if (arc) flags |= MoveFlag.Arc;
    this.out.writeMove(this.position[0], this.position[1], this.position[2], this.tool, flags, fileOffset, e);
  }

  private firmwareRetract(retract: boolean, fileOffset: number): void {
    const flag = retract ? MoveFlag.Retract : MoveFlag.Unretract;
    this.out.writeMove(this.position[0], this.position[1], this.position[2], this.tool, flag, fileOffset, 0);
  }

  private setPosition(t: Tokens): void {
    const any = t.hasParam('X') || t.hasParam('Y') || t.hasParam('Z') || t.hasParam('E');
    for (let a = 0; a < 3; a++) {
      if (any && !t.hasParam(AXES[a] ?? 'X')) continue;
      this.origin[a] = (this.position[a] ?? 0) - (any ? t.param(AXES[a] ?? 'X') : 0);
    }
    if (!any || t.hasParam('E')) this.ePosition = any ? t.param('E') : 0;
  }

  /** Returns false for an M code that is not interpreted (the caller keeps it as a marker). */
  private mCommand(t: Tokens, n: number): boolean {
    const out = this.out;
    switch (n) {
      case 82:
        this.eRelative = false;
        return true;
      case 83:
        this.eRelative = true;
        return true;
      case 104:
      case 109:
        return this.temperature(t, StateKind.HotendTemp, n === 109);
      case 140:
      case 190:
        return this.temperature(t, StateKind.BedTemp, n === 190);
      case 106: {
        const s = t.hasParam('S') ? t.param('S') : 255;
        const duty = this.flavour === 'reprapfirmware' && s <= 1 ? s : s / 255;
        out.change(StateKind.Fan, this.fanIndex(t), Math.min(1, Math.max(0, duty)));
        return true;
      }
      case 107:
        out.change(StateKind.Fan, this.fanIndex(t), 0);
        return true;
      case 204:
        this.letters(t, StateKind.Accel, 'S');
        this.letters(t, StateKind.AccelPrint, 'P');
        this.letters(t, StateKind.AccelRetract, 'R');
        this.letters(t, StateKind.AccelTravel, 'T');
        return true;
      case 201:
        this.axes(t, StateKind.MaxAccel, 1);
        return true;
      case 203:
        this.axes(t, StateKind.MaxFeedrate, this.flavour === 'reprapfirmware' ? 1 / 60 : 1);
        return true;
      case 205:
        this.axes(t, StateKind.Jerk, 1);
        this.letters(t, StateKind.JunctionDeviation, 'J');
        this.letters(t, StateKind.MinFeedrate, 'S');
        this.letters(t, StateKind.MinTravelFeedrate, 'T');
        return true;
      case 566:
        this.axes(t, StateKind.Jerk, 1 / 60);
        return true;
      case 900: // Marlin / Klipper linear advance: K in s
        if (t.hasParam('K'))
          out.change(
            StateKind.PressureAdvance,
            this.toolIndex(t.hasParam('T') ? t.param('T') : this.tool),
            t.param('K'),
          );
        return true;
      case 572: // RRF pressure advance: D extruder, S seconds
        if (t.hasParam('S'))
          out.change(StateKind.PressureAdvance, this.toolIndex(t.hasParam('D') ? t.param('D') : 0), t.param('S'));
        return true;
    }
    return false;
  }

  private temperature(t: Tokens, kind: StateKind, wait: boolean): boolean {
    const key = t.hasParam('S') ? 'S' : wait && t.hasParam('R') ? 'R' : '';
    if (key === '') return true;
    const index = kind === StateKind.HotendTemp ? this.toolIndex(t.hasParam('T') ? t.param('T') : this.tool) : 0;
    this.out.change(kind, index, t.param(key));
    return true;
  }

  private feedrate(mmPerMin: number): void {
    if (mmPerMin > 0) this.out.change(StateKind.Feedrate, 0, mmPerMin / 60);
  }

  private letters(t: Tokens, kind: StateKind, letter: string): void {
    if (t.hasParam(letter)) this.out.change(kind, 0, t.param(letter));
  }

  private axes(t: Tokens, kind: StateKind, scale: number): void {
    for (let a = 0; a < 4; a++) {
      const letter = AXES[a] ?? 'X';
      if (t.hasParam(letter)) this.out.change(kind, a, t.param(letter) * scale);
    }
  }

  private fanIndex(t: Tokens): number {
    return this.toolIndex(t.hasParam('P') ? t.param('P') : 0);
  }

  private toolIndex(v: number): number {
    return Number.isInteger(v) && v >= 0 && v <= 255 ? v : 0;
  }

  /** Klipper extended commands. Returns false when the command is not interpreted. */
  private extended(t: Tokens, fileOffset: number): boolean {
    if (t.name !== 'SET_VELOCITY_LIMIT' && t.name !== 'SET_PRESSURE_ADVANCE') return false;
    const args = new Map<string, string>();
    for (const word of t.args.split(/\s+/)) {
      const eq = word.indexOf('=');
      if (eq > 0) args.set(word.slice(0, eq).toUpperCase(), word.slice(eq + 1));
    }
    const num = (key: string): number | undefined => {
      const v = args.get(key);
      const x = v === undefined ? NaN : Number(v);
      return Number.isNaN(x) ? undefined : x;
    };
    const put = (key: string, kind: StateKind, index = 0): void => {
      const v = num(key);
      if (v !== undefined) this.out.change(kind, index, v);
    };
    if (t.name === 'SET_VELOCITY_LIMIT') {
      put('VELOCITY', StateKind.MaxVelocity);
      put('ACCEL', StateKind.Accel);
      put('ACCEL_TO_DECEL', StateKind.AccelToDecel);
      put('MINIMUM_CRUISE_RATIO', StateKind.MinCruiseRatio);
      put('SQUARE_CORNER_VELOCITY', StateKind.SquareCornerVelocity);
      return true;
    }
    let index = this.tool;
    const name = args.get('EXTRUDER');
    if (name !== undefined) {
      const m = /^extruder(\d*)$/i.exec(name);
      if (!m) {
        this.out.diagnostic(
          'unknown-extruder',
          'warning',
          fileOffset,
          `SET_PRESSURE_ADVANCE EXTRUDER=${name} is not extruder<n>; ignored`,
        );
        return true;
      }
      index = m[1] === '' ? 0 : Number(m[1]);
    }
    put('ADVANCE', StateKind.PressureAdvance, index);
    put('SMOOTH_TIME', StateKind.PressureAdvanceSmoothTime, index);
    return true;
  }
}
