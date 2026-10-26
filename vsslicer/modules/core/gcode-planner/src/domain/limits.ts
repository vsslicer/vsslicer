// SPDX-License-Identifier: AGPL-3.0-or-later

/** Firmware whose motion a planner models. */
export type Flavour = 'marlin' | 'klipper' | 'reprapfirmware';

/**
 * The machine's motion limits, flat so each value has its own source. Units: mm/s, mm/s^2, mm.
 * Each planner reads the fields its firmware has (see {@link FLAVOUR_FIELDS}) and ignores the rest.
 */
export interface MachineLimits {
  /** M203 / `machine_max_feedrate_*`: max axis speed, mm/s. */
  maxFeedrateX: number;
  maxFeedrateY: number;
  maxFeedrateZ: number;
  maxFeedrateE: number;
  /** M201 / `machine_max_acceleration_*`: max axis accel, mm/s^2. */
  maxAccelX: number;
  maxAccelY: number;
  maxAccelZ: number;
  maxAccelE: number;
  /** M205 X Y Z E / RRF M566: max instant speed change, mm/s. */
  jerkX: number;
  jerkY: number;
  jerkZ: number;
  jerkE: number;
  /** Klipper `max_accel`, M204 S: the single toolhead accel, mm/s^2. */
  accel: number;
  /** M204 P / `machine_max_acceleration_extruding`, mm/s^2. */
  accelPrint: number;
  /** M204 R / `machine_max_acceleration_retracting`, mm/s^2. */
  accelRetract: number;
  /** M204 T / `machine_max_acceleration_travel`, mm/s^2. */
  accelTravel: number;
  /** M205 J, mm; 0 means classic jerk. */
  junctionDeviation: number;
  /** M205 S / `machine_min_extruding_rate`, mm/s. */
  minFeedrate: number;
  /** M205 T / `machine_min_travel_rate`, mm/s. */
  minTravelFeedrate: number;
  /** Klipper `max_velocity`, mm/s. */
  maxVelocity: number;
  /** Klipper `square_corner_velocity`, mm/s. */
  squareCornerVelocity: number;
  /** Klipper `minimum_cruise_ratio`, 0..1. */
  minCruiseRatio: number;
}

export type LimitKey = keyof MachineLimits;

/** Where a resolved value came from. */
export type LimitSource = 'override' | 'config' | 'default';

export interface ResolvedLimits {
  flavour: Flavour;
  /** The flavour name was missing or unknown, so the limits and planner are Marlin's. */
  flavourAssumed: boolean;
  /** The name the flavour was resolved from, when there was one. */
  flavourName?: string;
  limits: MachineLimits;
  /**
   * Where each starting value came from. A non-`override` value can still be replaced mid-file by
   * the file's own limit commands (see `Planner`); an `override` never is.
   */
  sources: Record<LimitKey, LimitSource>;
  /**
   * A field this flavour reads came from the flavour defaults, not the user or the config block.
   * It does not look at in-file limit commands, so a file that sets its limits (SET_VELOCITY_LIMIT,
   * M201...) is still reported as assumed.
   */
  assumed: boolean;
}

const AXES = ['X', 'Y', 'Z', 'E'] as const;
const axes = (prefix: 'maxFeedrate' | 'maxAccel' | 'jerk'): LimitKey[] => AXES.map((a) => `${prefix}${a}` as LimitKey);

/** The fields each firmware's planner reads; only these decide `assumed`. */
export const FLAVOUR_FIELDS: Record<Flavour, readonly LimitKey[]> = {
  marlin: [
    ...axes('maxFeedrate'),
    ...axes('maxAccel'),
    ...axes('jerk'),
    'accelPrint',
    'accelRetract',
    'accelTravel',
    'junctionDeviation',
    'minFeedrate',
    'minTravelFeedrate',
  ],
  klipper: ['maxVelocity', 'accel', 'squareCornerVelocity', 'minCruiseRatio'],
  reprapfirmware: [
    ...axes('maxFeedrate'),
    ...axes('maxAccel'),
    ...axes('jerk'),
    'accelPrint',
    'accelTravel',
    'minFeedrate',
  ],
};

// Marlin@2ef3ee6:Marlin/Configuration.h: max feedrate :1373, max accel :1386, accel P/R/T :1401-1403,
// JD 0.013 and classic jerk X/Y 10, Z 0.3, E 5 :1413-1445 (checked by GCP-24).
const MARLIN: MachineLimits = {
  maxFeedrateX: 300,
  maxFeedrateY: 300,
  maxFeedrateZ: 5,
  maxFeedrateE: 25,
  maxAccelX: 3000,
  maxAccelY: 3000,
  maxAccelZ: 100,
  maxAccelE: 10000,
  jerkX: 10,
  jerkY: 10,
  jerkZ: 0.3,
  jerkE: 5,
  accel: 3000,
  accelPrint: 3000,
  accelRetract: 3000,
  accelTravel: 3000,
  junctionDeviation: 0.013,
  minFeedrate: 0,
  minTravelFeedrate: 0,
  maxVelocity: 300,
  squareCornerVelocity: 5,
  minCruiseRatio: 0.5,
};

/**
 * Values used when neither the user nor the file states a limit. Klipper has no defaults for
 * `max_velocity` / `max_accel` (printer.cfg requires them), so those are placeholders;
 * `square_corner_velocity` 5 is Klipper's default (klipper@ee2c6fb:klippy/toolhead.py:213-214).
 */
export const FLAVOUR_DEFAULTS: Record<Flavour, Readonly<MachineLimits>> = {
  marlin: MARLIN,
  // shortcut: max_velocity 300 / max_accel 3000 placeholders; minimum_cruise_ratio 0.5 unverified, GCP-20 checks.
  klipper: MARLIN,
  // RepRapFirmware@aebf629:src/Config/Configuration.h: max feed :33-35, max accel :37-39, jerk :47-49,
  // min speed :51, M204 P/T :57-58 (GCP-26). Fields RRF never reads keep Marlin's values.
  reprapfirmware: {
    ...MARLIN,
    maxFeedrateX: 100,
    maxFeedrateY: 100,
    maxFeedrateZ: 20,
    maxFeedrateE: 100,
    maxAccelX: 1000,
    maxAccelY: 1000,
    maxAccelZ: 200,
    maxAccelE: 500,
    jerkX: 15,
    jerkY: 15,
    jerkZ: 10,
    jerkE: 5,
    accel: 50000,
    accelPrint: 50000,
    accelTravel: 50000,
    minFeedrate: 0.5,
  },
};

/** Config-block keys per field, first match wins: PrusaSlicer/SuperSlicer, Orca/Bambu, Cura. */
const CONFIG_KEYS: Partial<Record<LimitKey, readonly string[]>> = {
  maxFeedrateX: ['machine_max_feedrate_x', 'machine_max_speed_x'],
  maxFeedrateY: ['machine_max_feedrate_y', 'machine_max_speed_y'],
  maxFeedrateZ: ['machine_max_feedrate_z', 'machine_max_speed_z'],
  maxFeedrateE: ['machine_max_feedrate_e', 'machine_max_speed_e'],
  maxAccelX: ['machine_max_acceleration_x'],
  maxAccelY: ['machine_max_acceleration_y'],
  maxAccelZ: ['machine_max_acceleration_z'],
  maxAccelE: ['machine_max_acceleration_e'],
  jerkX: ['machine_max_jerk_x', 'machine_max_jerk_xy'],
  jerkY: ['machine_max_jerk_y', 'machine_max_jerk_xy'],
  jerkZ: ['machine_max_jerk_z'],
  jerkE: ['machine_max_jerk_e'],
  accel: ['machine_acceleration'],
  accelPrint: ['machine_max_acceleration_extruding'],
  accelRetract: ['machine_max_acceleration_retracting'],
  accelTravel: ['machine_max_acceleration_travel'],
  junctionDeviation: ['machine_max_junction_deviation'],
  minFeedrate: ['machine_min_extruding_rate'],
  minTravelFeedrate: ['machine_min_travel_rate'],
};

/** Fields where 0 is a real setting rather than "not set" (JD 0 selects classic jerk). */
const ZERO_VALID: ReadonlySet<LimitKey> = new Set<LimitKey>([
  ...axes('jerk'),
  'junctionDeviation',
  'minFeedrate',
  'minTravelFeedrate',
]);

const MARLIN_NAMES = new Set(['marlin', 'marlin2', 'marlinlegacy', 'reprap (marlin/sprinter)']);

/** Maps a `gcode_flavor` / `;FLAVOR:` name to a flavour; `undefined` for an unknown name. */
export function flavourFromName(name: string): Flavour | undefined {
  const n = name.trim().toLowerCase();
  if (n === 'klipper') return 'klipper';
  if (n === 'reprapfirmware') return 'reprapfirmware';
  return MARLIN_NAMES.has(n) ? 'marlin' : undefined;
}

/** First number of a `normal,silent` list; undefined when unset or unparseable. */
function configValue(key: LimitKey, raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const v = Number(raw.split(',')[0]);
  return validLimit(key, v) ? v : undefined;
}

const KLIPPER_STRICT: ReadonlySet<LimitKey> = new Set<LimitKey>(['accel', 'maxVelocity']);

/** One positivity rule for config and override: finite, >= 0, and 0 only where it is a real setting. */
const validLimit = (key: LimitKey, v: number): boolean =>
  Number.isFinite(v) && v >= 0 && (v > 0 || ZERO_VALID.has(key));

export interface LimitInputs {
  /** The file's flavour name (`;FLAVOR:`, `gcode_flavor`); else `config.gcode_flavor` is read. */
  flavour?: string;
  /** `ParsedFile.config`. */
  config?: Record<string, string>;
  /** Values the user set; they beat the file. Each must pass the config reader's rule: finite, and > 0 unless 0 is a real setting. */
  override?: Partial<MachineLimits>;
}

/** Resolves each limit from the override, then the file's config block, then the flavour defaults; planners apply in-file commands on top. */
export function resolveLimits({ flavour, config = {}, override = {} }: LimitInputs): ResolvedLimits {
  const flavourName = flavour ?? config['gcode_flavor'];
  const known = flavourName === undefined ? undefined : flavourFromName(flavourName);
  const f: Flavour = known ?? 'marlin';
  const defaults = FLAVOUR_DEFAULTS[f];
  const limits = { ...defaults };
  const sources = {} as Record<LimitKey, LimitSource>;
  for (const key of Object.keys(defaults) as LimitKey[]) {
    const o = override[key];
    if (o !== undefined) {
      // Marlin's per-axis maxima use 0 as "no limit", so only the shared toolhead keys get the strict rule.
      if (!Number.isFinite(o) || o < 0 || (o === 0 && KLIPPER_STRICT.has(key)))
        throw new RangeError(`limit ${key} must be a finite number > 0 (>= 0 where 0 is a setting), got ${o}`);
      limits[key] = o;
      sources[key] = 'override';
      continue;
    }
    const c = CONFIG_KEYS[key]?.map((k) => configValue(key, config[k])).find((v) => v !== undefined);
    if (c !== undefined) {
      limits[key] = c;
      sources[key] = 'config';
    } else sources[key] = 'default';
  }
  return {
    flavour: f,
    flavourAssumed: known === undefined,
    ...(flavourName !== undefined && { flavourName }),
    limits,
    sources,
    assumed: FLAVOUR_FIELDS[f].some((k) => sources[k] === 'default'),
  };
}
