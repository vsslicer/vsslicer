// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  bambuCatalogue,
  curaCatalogue,
  orcaCatalogue,
  prusaCatalogue,
  superslicerCatalogue,
  type Catalogue,
  type CatalogueEntry,
} from '@vsslicer/profile-api';
import { describe, expect, test } from 'vitest';
import {
  buildFormModel,
  FormModelError,
  MAX_FORM_FIELDS,
  type FormModel,
} from '../src/application/form-model/index.ts';

const full: Catalogue = Object.assign(
  {},
  ...[orcaCatalogue, bambuCatalogue, prusaCatalogue, superslicerCatalogue, curaCatalogue].map((c) => c.entries),
);

// One line per group, subgroup and field; a catalogue change shows as a diff of this file.
const outline = (model: FormModel) =>
  model
    .flatMap((g) => [
      `${g.id}`,
      ...g.subgroups.flatMap((s) => [
        `  ${s.home}`,
        ...s.fields.map(
          (f) =>
            `    ${f.key} ${f.widget}${f.entry.list ? ' list' : ''}${f.entry.per_extruder ? ' per_extruder' : ''}${f.entry.hidden ? ' hidden' : ''}`,
        ),
      ]),
    ])
    .join('\n') + '\n';

const entry = (over: Partial<CatalogueEntry> = {}): CatalogueEntry => ({
  group: 'layers',
  home: 'process',
  type: 'float',
  label: 'Layer height',
  native: { orca: { key: 'layer_height' } },
  ...over,
});

describe('full catalogue', () => {
  const model = buildFormModel(full);

  test('matches the reviewed snapshot', async () => {
    await expect(outline(model)).toMatchFileSnapshot('__snapshots__/form-model.txt');
  });

  test('every key appears once', () => {
    const keys = model.flatMap((g) => g.subgroups.flatMap((s) => s.fields.map((f) => f.key)));
    expect(keys.length).toBe(Object.keys(full).length);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

test('a key added to a fixture appears without a code change', () => {
  const fixture: Catalogue = { layer_height: entry() };
  expect(buildFormModel(fixture)[0]!.subgroups[0]!.fields.map((f) => f.key)).toEqual(['layer_height']);
  fixture['retraction_length'] = entry({ group: 'extrusion', home: 'printer_model', type: 'bool', label: 'Retract' });
  const extrusion = buildFormModel(fixture).find((g) => g.id === 'extrusion')!;
  expect(extrusion.subgroups).toMatchObject([
    { home: 'printer_model', fields: [{ key: 'retraction_length', label: 'Retract', widget: 'checkbox' }] },
  ]);
});

test('orders groups by schema, subgroups by home, fields by catalogue; drops empty subgroups', () => {
  const model = buildFormModel({
    b: entry({ group: 'multi_material', home: 'printer_model' }),
    a: entry({ group: 'multi_material', home: 'process' }),
    c: entry({ group: 'multi_material', home: 'process', hidden: true, label: undefined }),
  });
  expect(model[0]!.id).toBe('layers');
  expect(model[0]!.subgroups).toEqual([]);
  const mm = model.find((g) => g.id === 'multi_material')!;
  expect(mm.subgroups.map((s) => [s.home, s.fields.map((f) => f.key)])).toEqual([
    ['process', ['a', 'c']],
    ['printer_model', ['b']],
  ]);
  expect(mm.subgroups[0]!.fields[1]!.label).toBe('c'); // a hidden key without a label shows its key
});

test.each(['matrix', 'constructor', 'toString', '__proto__'])('a type %s with no widget kind fails', (type) => {
  const bad = entry({ type: type as CatalogueEntry['type'] });
  expect(() => buildFormModel({ ...full, bad })).toThrow(new FormModelError(`bad: type ${type} has no widget kind`));
});

test('a home outside its group fails', () => {
  expect(() => buildFormModel({ x: entry({ home: 'material' }) })).toThrow(FormModelError);
});

test('an oversize catalogue is refused before it is walked', () => {
  const huge = new Proxy({} as Catalogue, {
    ownKeys: () => Array.from({ length: MAX_FORM_FIELDS + 1 }, (_, i) => `k${i}`),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    get: () => {
      throw new Error('walked');
    },
  });
  expect(() => buildFormModel(huge)).toThrow(/over 20000/);
});
