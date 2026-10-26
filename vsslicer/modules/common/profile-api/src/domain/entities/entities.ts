// SPDX-License-Identifier: AGPL-3.0-or-later
// The eight entities of profiles.md §6. References to other entities are by `id`.
import type { Condition, EntityBase } from './shared.ts';

export type Technology = 'fff';
export type FeederType = 'mmu' | 'ams' | 'toolchanger';

export interface Vendor {
  id: string;
  name: string;
  /** semver */
  version: string;
  /** SPDX identifier */
  license: string;
  update?: { url: string; channel: string };
  source?: {
    format: 'prusa-ini' | 'prusa-yaml' | 'orca-json' | 'bambu-json' | 'cura';
    origin: string;
    commit: string;
  };
  attribution?: string[];
}

export interface PrinterModel extends EntityBase {
  vendor: string;
  name: string;
  technology: Technology;
  bed: { shape: [number, number][]; max_height: number };
  toolheads: { count: number; kinematics: string };
  family?: string;
  assets?: { bed_model?: string; bed_texture?: string; thumbnail?: string };
  features?: { input_shaper?: boolean; chamber?: boolean; [feature: string]: boolean | undefined };
  /** Allowed nozzle ids, or a condition. */
  nozzles?: string[] | Condition;
  /** Allowed surface ids, or a condition. */
  surfaces?: string[] | Condition;
  defaults?: { process?: string; materials?: string[] };
  firmware?: { flavor?: string; gcode_templates?: { [name: string]: string } };
}

export interface Nozzle extends EntityBase {
  /** mm */
  diameter: number;
  flow?: 'standard' | 'high_flow';
  /** brass, hardened_steel, ruby, ... */
  material?: string;
  hrc?: number;
  extruder_type?: 'direct' | 'bowden';
  volume_type?: string;
}

export interface Surface extends EntityBase {
  /** pei_smooth, pei_textured, cool, engineering, glass, ... */
  type: string;
}

export interface Feeder extends EntityBase {
  slots: number;
  type?: FeederType;
}

export interface Material extends EntityBase {
  vendor: string;
  name: string;
  /** PLA, PETG, ... */
  type: string;
  /** mm */
  diameter: number;
  brand?: string;
  color?: string;
  /** g/cm3 */
  density?: number;
  cost?: { amount: number; currency: string; per: 'kg' };
  /** g */
  spool_weight?: number;
  external_ids?: { cura_guid?: string; bambu_filament_id?: string; orca_filament_id?: string; prusa_name?: string };
}

export interface Process extends EntityBase {
  name: string;
  /** mm */
  layer_height: number;
  intent?: 'standard' | 'quality' | 'speed' | 'engineering';
}

export interface PrinterInstance extends EntityBase {
  /** printer_model id */
  model: string;
  toolheads: { slot: number; nozzle: string }[];
  surface?: string;
  feeder?: { type: FeederType; slots: number };
  /** `host_type` is a plain string here; validated against the connectors in E16. `secret_ref` is a VS Code SecretStorage key, never the credential. */
  connection?: { host_type: string; url: string; secret_ref: string };
}
