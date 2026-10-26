// SPDX-License-Identifier: AGPL-3.0-or-later
// A value in an entity's `settings` map (profiles.md §6). Per-extruder values are keyed maps
// (`{"0": 0.4, "1": 0.6}`), never positional arrays; `null` means "not set here, fall through".

/** A Cura formula kept as written (`=math.ceil(speed_print * 30 / 70)`); only a Cura-compatible evaluator can use it. */
export interface SettingExpr {
  expr: string;
}

export type SettingScalar = string | number | boolean;

export type SettingValue = SettingScalar | null | SettingExpr | SettingValue[] | { [key: string]: SettingValue };

/** Unified setting key to value. */
export type Settings = { [key: string]: SettingValue };
