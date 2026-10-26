// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Settings } from './settings.ts';

/** A compatibility expression (profiles.md §6 "Conditions"); parsed and evaluated elsewhere. */
export type Condition = string;

export interface Override {
  when: Condition;
  /** `first`: stop at the first matching block; `all`: apply every matching block. */
  match?: 'first' | 'all';
  settings: Settings;
}

export interface Meta {
  created?: string;
  updated?: string;
  /** The version of the parent this entity's stored diff was based on. */
  base_version?: string;
}

/** Fields every profile entity shares except `vendor`. */
export interface EntityBase {
  id: string;
  inherits?: string[];
  abstract?: boolean;
  when?: Condition;
  overrides?: Override[];
  settings?: Settings;
  renamed_from?: string[];
  meta?: Meta;
}
