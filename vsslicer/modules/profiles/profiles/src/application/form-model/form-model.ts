// SPDX-License-Identifier: AGPL-3.0-or-later
// The settings form's layout, generated from the catalogue (PRF-70): a new key appears without UI code.
import {
  GROUPS,
  type Catalogue,
  type CatalogueEntry,
  type Group,
  type HomeEntity,
  type SettingType,
} from '@vsslicer/profile-api';

/** Base widget kinds. PRF-181 adds percent-or-absolute, per-extruder, gcode and `{expr}` kinds. */
export type WidgetKind = 'checkbox' | 'number' | 'text' | 'select' | 'point' | 'polygon';

// `Record<SettingType, ...>` fails to compile when a type is added to the catalogue without a widget kind.
export const WIDGET_KINDS: Record<SettingType, WidgetKind> = {
  bool: 'checkbox',
  int: 'number',
  float: 'number',
  percent: 'number',
  float_or_percent: 'text',
  string: 'text',
  gcode: 'text',
  enum: 'select',
  point: 'point',
  polygon: 'polygon',
};

export interface FormField {
  key: string;
  label: string;
  widget: WidgetKind;
  entry: CatalogueEntry;
}

/** The keys of one group stored in one entity, in catalogue order. */
export interface FormSubgroup {
  home: HomeEntity;
  fields: FormField[];
}

export interface FormGroup {
  id: Group;
  label: string;
  subgroups: FormSubgroup[];
}

export type FormModel = FormGroup[];

/** The bundled catalogues hold about 1,930 keys; more is not a catalogue. */
export const MAX_FORM_FIELDS = 20_000;

export class FormModelError extends Error {
  override name = 'FormModelError';
}

/**
 * Groups in E11's order, each with one subgroup per home entity (in the group's `homes` order) that has keys,
 * fields in catalogue order. Hidden keys are kept; hiding them is the view's toggle. Throws on a key whose
 * type has no widget kind, or whose group or home is not in the schema (the data is cast from JSON).
 */
export function buildFormModel(catalogue: Catalogue): FormModel {
  const keys = Object.keys(catalogue);
  if (keys.length > MAX_FORM_FIELDS) throw new FormModelError(`${keys.length} keys, over ${MAX_FORM_FIELDS}`);
  const model: FormModel = GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    subgroups: g.homes.map((home) => ({ home, fields: [] })),
  }));
  for (const key of keys) {
    const entry = catalogue[key]!;
    const widget = Object.hasOwn(WIDGET_KINDS, entry.type) ? WIDGET_KINDS[entry.type] : undefined; // own keys only: `constructor` is not a kind
    if (!widget) throw new FormModelError(`${key}: type ${entry.type} has no widget kind`);
    const sub = model.find((g) => g.id === entry.group)?.subgroups.find((s) => s.home === entry.home);
    if (!sub) throw new FormModelError(`${key}: home ${entry.home} is not in group ${entry.group}`);
    sub.fields.push({ key, label: entry.label ?? key, widget, entry });
  }
  for (const g of model) g.subgroups = g.subgroups.filter((s) => s.fields.length > 0);
  return model;
}
