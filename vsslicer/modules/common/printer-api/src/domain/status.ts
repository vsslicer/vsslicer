// SPDX-License-Identifier: AGPL-3.0-or-later
import { PrinterError } from './errors.ts';

/**
 * The normalised status every adapter maps into. Shapes from printer-connectivity.md, bambu-connectivity.md
 * and printer-position-fields.md; the hardest case is Bambu H2C (two extruders on one toolhead, AMS trays,
 * HMS codes: ha-bambulab@0e027ff:custom_components/bambu_lab/pybambu/mock_data/MOCK-H2C.json).
 */
export const PRINTER_STATES = ['idle', 'printing', 'paused', 'error', 'busy', 'offline'] as const;
export type PrinterState = (typeof PRINTER_STATES)[number];

export const HEATER_KINDS = ['nozzle', 'bed', 'chamber', 'other'] as const;
export type HeaterKind = (typeof HEATER_KINDS)[number];

export const NOTIFICATION_SEVERITIES = ['info', 'warning', 'error', 'fatal'] as const;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

/** Temperatures in degrees C. `extruder` ties a nozzle heater to an Extruder.index. */
export interface Heater {
  readonly id: string;
  readonly kind: HeaterKind;
  readonly current: number;
  readonly target?: number;
  readonly extruder?: number;
}

export interface Extruder {
  readonly index: number;
  readonly nozzleDiameter?: number; // mm
  readonly nozzleType?: string;
  readonly tray?: string; // Material.tray currently loaded
}

/** One moving head; H2C has one toolhead with two extruders, an IDEX or toolchanger several toolheads. */
export interface Toolhead {
  readonly index: number;
  readonly activeExtruder?: number;
  readonly extruders: readonly Extruder[];
}

export interface Job {
  readonly file: string;
  readonly progress?: number; // 0..100
  readonly remainingSeconds?: number;
}

/** Same shape as D20's PrintPosition in @vsslicer/gcode-api, kept structural so printer-api needs no dependency on it. */
export interface PrintPosition {
  readonly fileOffset?: number; // bytes in the decoded G-code text
  readonly layer?: number; // as the printer reports it (1-based per D20; Bambu reports 0 before the first layer)
  readonly z?: number; // mm
  readonly percent?: number; // 0..100
}

export interface Material {
  readonly tray: string; // e.g. Bambu "0-2" (AMS 0, slot 2) or "ext-0"
  readonly type?: string;
  readonly colour?: string; // vendor colour string, e.g. "FF0000FF"
  readonly remain?: number; // percent 0..100
}

export interface Notification {
  readonly code: string; // e.g. a Bambu HMS code
  readonly severity: NotificationSeverity;
  readonly message: string;
  readonly link?: string;
}

/** A cap that cut input down: which field and why. */
export interface Truncation {
  readonly field: string;
  readonly reason: 'tooMany' | 'tooLong';
}

export interface PrinterStatus {
  readonly state: PrinterState;
  readonly vendorState: string; // the printer's own state string, e.g. Bambu gcode_state "RUNNING"
  readonly heaters: readonly Heater[];
  readonly toolheads: readonly Toolhead[];
  readonly job?: Job;
  readonly position?: PrintPosition;
  readonly materials: readonly Material[];
  readonly notifications: readonly Notification[];
  readonly truncations: readonly Truncation[];
}

export type PrinterStatusInput = Omit<PrinterStatus, 'truncations'>;

/** A partial push. Keyed lists merge by key (heaters by id, toolheads by index, materials by tray); notifications and position replace; null clears job or position. */
export interface StatusPatch {
  readonly state?: PrinterState;
  readonly vendorState?: string;
  readonly heaters?: readonly Partial<Heater>[];
  readonly toolheads?: readonly Partial<Toolhead>[];
  readonly job?: Partial<Job> | null;
  readonly position?: PrintPosition | null;
  readonly materials?: readonly Partial<Material>[];
  readonly notifications?: readonly Notification[];
}

export const STATUS_LIMITS = {
  heaters: 64,
  toolheads: 16,
  extruders: 16,
  materials: 256,
  notifications: 256,
  vendorState: 256,
  id: 256,
  message: 4096,
} as const;

export type InvalidStatusReason = 'notFinite' | 'outOfRange' | 'notInteger' | 'invalidValue' | 'missing' | 'duplicate';

/** A refused status field. */
export class InvalidStatusError extends PrinterError {
  readonly field: string;
  readonly reason: InvalidStatusReason;

  constructor(field: string, reason: InvalidStatusReason) {
    super('protocol', `printer status ${field}: ${reason}`);
    this.name = 'InvalidStatusError';
    this.field = field;
    this.reason = reason;
  }
}

class Builder {
  readonly truncations: Truncation[] = [];

  /** Reads at most `max` items, so a hostile array costs O(max) whatever its length. */
  list<T, R>(field: string, v: readonly T[] | undefined, max: number, each: (x: T, f: string) => R): readonly R[] {
    if (v === undefined) return Object.freeze([]);
    if (!Array.isArray(v)) throw new InvalidStatusError(field, 'invalidValue');
    const n = v.length;
    if (n > max) this.truncations.push({ field, reason: 'tooMany' });
    const out: R[] = [];
    for (let i = 0; i < Math.min(n, max); i++) out.push(each(v[i] as T, `${field}[${i}]`));
    return Object.freeze(out);
  }

  str(field: string, v: unknown, max: number): string {
    if (typeof v !== 'string') throw new InvalidStatusError(field, v === undefined ? 'missing' : 'invalidValue');
    if (v.length <= max) return v;
    this.truncations.push({ field, reason: 'tooLong' });
    return v.slice(0, max);
  }

  optStr(field: string, v: unknown, max: number): string | undefined {
    return v === undefined ? undefined : this.str(field, v, max);
  }
}

function num(field: string, v: unknown, min: number, max: number, integer = false): number {
  if (typeof v !== 'number') throw new InvalidStatusError(field, v === undefined ? 'missing' : 'invalidValue');
  if (!Number.isFinite(v)) throw new InvalidStatusError(field, 'notFinite');
  if (integer && !Number.isSafeInteger(v)) throw new InvalidStatusError(field, 'notInteger');
  if (v < min || v > max) throw new InvalidStatusError(field, 'outOfRange');
  return v;
}

/** Refuses a key already seen in this list; one Set per list keeps the check linear. */
function unique<K>(seen: Set<K>, field: string, key: K): K {
  if (seen.has(key)) throw new InvalidStatusError(field, 'duplicate');
  seen.add(key);
  return key;
}

const optNum = (field: string, v: unknown, min: number, max: number, integer = false) =>
  v === undefined ? undefined : num(field, v, min, max, integer);

function oneOf<T extends string>(field: string, v: unknown, allowed: readonly T[]): T {
  if (!allowed.includes(v as T)) throw new InvalidStatusError(field, v === undefined ? 'missing' : 'invalidValue');
  return v as T;
}

/** Drops undefined keys so frozen objects compare equal regardless of how they were built. */
function obj<T extends object>(o: T): T {
  for (const k of Object.keys(o))
    if ((o as Record<string, unknown>)[k] === undefined) delete (o as Record<string, unknown>)[k];
  return Object.freeze(o);
}

const TEMP: [number, number] = [-50, 1000];
const INDEX_MAX = 1023;

/** Validates, caps and deep-freezes a status. Throws InvalidStatusError on a bad number or enum; truncates long lists and strings into `truncations`. */
export function createPrinterStatus(input: PrinterStatusInput): PrinterStatus {
  const b = new Builder();
  const { id, message } = STATUS_LIMITS;
  const heaterIds = new Set<string>();
  const heaters = b.list('heaters', input.heaters, STATUS_LIMITS.heaters, (h, f) =>
    obj({
      id: unique(heaterIds, `${f}.id`, b.str(`${f}.id`, h.id, id)),
      kind: oneOf(`${f}.kind`, h.kind, HEATER_KINDS),
      current: num(`${f}.current`, h.current, ...TEMP),
      target: optNum(`${f}.target`, h.target, ...TEMP),
      extruder: optNum(`${f}.extruder`, h.extruder, 0, INDEX_MAX, true),
    }),
  );
  const toolheadIndexes = new Set<number>();
  const toolheads = b.list('toolheads', input.toolheads, STATUS_LIMITS.toolheads, (t, f) => {
    const extruderIndexes = new Set<number>();
    return obj({
      index: unique(toolheadIndexes, `${f}.index`, num(`${f}.index`, t.index, 0, INDEX_MAX, true)),
      activeExtruder: optNum(`${f}.activeExtruder`, t.activeExtruder, 0, INDEX_MAX, true),
      extruders: b.list(`${f}.extruders`, t.extruders, STATUS_LIMITS.extruders, (e, g) =>
        obj({
          index: unique(extruderIndexes, `${g}.index`, num(`${g}.index`, e.index, 0, INDEX_MAX, true)),
          nozzleDiameter: optNum(`${g}.nozzleDiameter`, e.nozzleDiameter, Number.MIN_VALUE, 10),
          nozzleType: b.optStr(`${g}.nozzleType`, e.nozzleType, id),
          tray: b.optStr(`${g}.tray`, e.tray, id),
        }),
      ),
    });
  });
  const j = input.job;
  const job =
    j === undefined
      ? undefined
      : obj({
          file: b.str('job.file', j.file, message),
          progress: optNum('job.progress', j.progress, 0, 100),
          remainingSeconds: optNum('job.remainingSeconds', j.remainingSeconds, 0, Number.MAX_SAFE_INTEGER),
        });
  const p = input.position;
  let position: PrintPosition | undefined;
  if (p !== undefined) {
    position = obj({
      fileOffset: optNum('position.fileOffset', p.fileOffset, 0, Number.MAX_SAFE_INTEGER, true),
      layer: optNum('position.layer', p.layer, 0, Number.MAX_SAFE_INTEGER, true),
      z: optNum('position.z', p.z, -1e4, 1e4),
      percent: optNum('position.percent', p.percent, 0, 100),
    });
    if (Object.keys(position).length === 0) throw new InvalidStatusError('position', 'missing'); // D20: at least one field
  }
  const trays = new Set<string>();
  const materials = b.list('materials', input.materials, STATUS_LIMITS.materials, (m, f) =>
    obj({
      tray: unique(trays, `${f}.tray`, b.str(`${f}.tray`, m.tray, id)),
      type: b.optStr(`${f}.type`, m.type, id),
      colour: b.optStr(`${f}.colour`, m.colour, id),
      remain: optNum(`${f}.remain`, m.remain, 0, 100),
    }),
  );
  const notifications = b.list('notifications', input.notifications, STATUS_LIMITS.notifications, (n, f) =>
    obj({
      code: b.str(`${f}.code`, n.code, id),
      severity: oneOf(`${f}.severity`, n.severity, NOTIFICATION_SEVERITIES),
      message: b.str(`${f}.message`, n.message, message),
      link: b.optStr(`${f}.link`, n.link, message),
    }),
  );
  return obj({
    state: oneOf('state', input.state, PRINTER_STATES),
    vendorState: b.str('vendorState', input.vendorState, STATUS_LIMITS.vendorState),
    heaters,
    toolheads,
    job,
    position,
    materials,
    notifications,
    truncations: Object.freeze(b.truncations.map((t) => Object.freeze(t))),
  });
}

/** Merges by key, keeping base order and appending new keys. Reads at most `max` patch items (the result is capped again by createPrinterStatus). */
function byKey<T, K extends keyof T>(
  base: readonly T[],
  patch: readonly Partial<T>[] | undefined,
  key: K,
  max: number,
): T[] {
  const out = [...base];
  if (patch === undefined) return out;
  if (!Array.isArray(patch)) throw new InvalidStatusError(String(key), 'invalidValue');
  for (let i = 0; i < Math.min(patch.length, max); i++) {
    const p = patch[i] as Partial<T>;
    const at = out.findIndex((x) => x[key] === p[key]);
    if (at === -1) out.push(p as T);
    else out[at] = { ...out[at], ...p } as T;
  }
  return out;
}

const LIST_KEYS: Readonly<Record<string, string>> = {
  heaters: 'id',
  toolheads: 'index',
  extruders: 'index',
  materials: 'tray',
};
const LIST_MAX: Readonly<Record<string, number>> = STATUS_LIMITS;

/**
 * True when the patch replaces the value a base cut was taken from (`path` is the cut's field split into names and
 * indexes). Keyed lists merge, so a list cut stays and an item's string cut goes only when the patch item with the
 * same key sets that field to a new value; `job` merges, so only `job: null` or a different `job.file` clears
 * `job.file`; the other fields (vendorState, notifications, position) are replaced by `null` or a value `!==` the base's.
 */
function replaces(base: unknown, patch: unknown, path: readonly string[]): boolean {
  const [name, ...rest] = path;
  if (name === undefined || typeof patch !== 'object' || patch === null) return false;
  const v = (patch as Record<string, unknown>)[name];
  const b = (base as Record<string, unknown> | undefined)?.[name];
  if (v === undefined) return false;
  const k = LIST_KEYS[name];
  // an equal value still holds the cut value, so it keeps the cut (rule 28: string compare, reference for lists/objects)
  if (k === undefined) return v === null || (name === 'job' && rest.length > 0 ? replaces(b, v, rest) : v !== b);
  const [i, ...field] = rest;
  if (i === undefined || !Array.isArray(v) || !Array.isArray(b)) return false; // `<list> tooMany`: base items are all kept
  const id = (b[Number(i)] as Record<string, unknown> | undefined)?.[k];
  for (let j = 0; j < Math.min(v.length, (LIST_MAX[name] ?? 0) + 1); j++) {
    const item = v[j] as Record<string, unknown> | null | undefined;
    if (item?.[k] === id) return replaces(b[Number(i)], item, field); // a key-field cut matches only an equal key, so it stays
  }
  return false;
}

/** Applies a partial push to a status and returns a new validated status; the base is not changed. */
export function mergeStatus(base: PrinterStatus, patch: StatusPatch): PrinterStatus {
  const L = STATUS_LIMITS;
  const toolheads = byKey(base.toolheads, patch.toolheads, 'index', L.toolheads + 1).map((t) => {
    const old = base.toolheads.find((o) => o.index === t.index);
    const extruders =
      old && t.extruders !== old.extruders ? byKey(old.extruders, t.extruders, 'index', L.extruders + 1) : t.extruders;
    return { ...t, extruders };
  });
  const merged = {
    state: patch.state ?? base.state,
    vendorState: patch.vendorState ?? base.vendorState,
    heaters: byKey(base.heaters, patch.heaters, 'id', L.heaters + 1),
    toolheads,
    job: patch.job === null ? undefined : patch.job === undefined ? base.job : ({ ...base.job, ...patch.job } as Job),
    position: patch.position === null ? undefined : (patch.position ?? base.position),
    materials: byKey(base.materials, patch.materials, 'tray', L.materials + 1),
    notifications: patch.notifications ?? base.notifications,
  };
  const fresh = createPrinterStatus(merged);
  // A base cut stays until the patch replaces what was cut; fresh and kept base cuts can both say `<list> tooMany`.
  const seen = new Set<string>();
  const truncations = [
    ...fresh.truncations,
    ...base.truncations.filter((t) => !replaces(base, patch, t.field.split(/[[\].]+/))),
  ].filter((t) => {
    const k = `${t.field}\0${t.reason}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return Object.freeze({ ...fresh, truncations: Object.freeze(truncations) });
}
