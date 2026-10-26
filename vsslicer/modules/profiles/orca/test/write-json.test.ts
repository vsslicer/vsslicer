// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import {
  MAX_JSON_DEPTH,
  readOrcaJson,
  writeOrcaJson,
  writeOrcaUserPreset,
  type OrcaDialect,
  type OrcaJsonNative,
} from '../src/adapters/export/orca/write-json.ts';
import { TREE_LIMITS, type PresetType } from '../src/adapters/tree/read-tree.ts';
import { readOrcaUserPresets } from '../src/adapters/user/read-user-presets.ts';
import { decodeVariants } from '../src/adapters/variants/variants.ts';

const enc = new TextEncoder();
const dec = new TextDecoder();
const read = (text: string | Uint8Array) => {
  const r = readOrcaJson(typeof text === 'string' ? enc.encode(text) : text);
  if ('error' in r) throw new Error(r.error);
  return r;
};

// User presets laid out as the slicers save them: sorted keys, Orca one tab per level
// (OrcaSlicer@09aa0114:src/libslic3r/Config.cpp:1600), Bambu four spaces (BambuStudio@79df7ae:src/libslic3r/Config.cpp:1571);
// a child stores its diff with "nil" for slots equal to the parent's (OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:795-816).
const USER: { path: string; dialect: OrcaDialect; text: string }[] = [
  {
    path: 'user/42/filament/My PLA.json',
    dialect: 'orca',
    text: `{
\t"filament_flow_ratio": [
\t\t"0.98"
\t],
\t"filament_retraction_length": [
\t\t"nil"
\t],
\t"filament_settings_id": [
\t\t"My PLA"
\t],
\t"from": "User",
\t"inherits": "Bambu PLA Basic @BBL X1C",
\t"is_custom_defined": "0",
\t"name": "My PLA",
\t"nozzle_temperature": [
\t\t"215"
\t],
\t"version": "2.3.0.4"
}
`,
  },
  {
    path: 'user/42/machine/My H2C.json',
    dialect: 'orca',
    text: `{
\t"from": "User",
\t"inherits": "Bambu Lab H2C 0.4 nozzle",
\t"machine_max_speed_x": [
\t\t"500",
\t\t"nil",
\t\t"500",
\t\t"200",
\t\t"nil",
\t\t"nil",
\t\t"480",
\t\t"200",
\t\t"nil",
\t\t"nil"
\t],
\t"machine_start_gcode": "G28 ; home\\nM104 S200 ; 200°C \\"hot\\"\\n",
\t"name": "My H2C",
\t"nozzle_diameter": [
\t\t"0.4",
\t\t"0.4"
\t],
\t"printer_extruder_id": [
\t\t"1",
\t\t"1",
\t\t"1",
\t\t"2",
\t\t"2"
\t],
\t"printer_extruder_variant": [
\t\t"Direct Drive Standard",
\t\t"Direct Drive High Flow",
\t\t"Direct Drive E3D High Flow",
\t\t"Direct Drive Standard",
\t\t"Direct Drive High Flow"
\t],
\t"printer_settings_id": "My H2C",
\t"retraction_length": [
\t\t"0.8",
\t\t"nil",
\t\t"nil",
\t\t"0.5",
\t\t"nil"
\t],
\t"version": "2.3.0.4"
}
`,
  },
  {
    path: 'user/42/process/Standalone.json',
    dialect: 'orca',
    text: `{
\t"compatible_printers": [],
\t"from": "User",
\t"inherits": "",
\t"is_custom_defined": "0",
\t"layer_height": "0.2",
\t"name": "Standalone",
\t"print_settings_id": "Standalone",
\t"version": "2.3.0.4",
\t"wall_loops": "3"
}
`,
  },
  {
    path: 'user/77/process/Fast H2D.json',
    dialect: 'bambu',
    text: `{
    "from": "User",
    "inherits": "0.20mm Standard @BBL H2D",
    "name": "Fast H2D",
    "outer_wall_speed": [
        "250",
        "nil"
    ],
    "print_extruder_id": [
        "1",
        "2"
    ],
    "print_extruder_variant": [
        "Direct Drive Standard",
        "Direct Drive Standard"
    ],
    "print_settings_id": "Fast H2D",
    "version": "02.04.00.70"
}
`,
  },
];

describe('user presets', () => {
  test.each(USER)('$path: import then export is byte for byte, with and without its native form', (f) => {
    const bytes = enc.encode(f.text);
    const r = readOrcaUserPresets([{ path: f.path, bytes }], { presets: [] });
    expect(r.diagnostics.map((d) => d.code).filter((c) => c !== 'unknown-parent')).toEqual([]);
    expect(r.presets).toHaveLength(1);
    const p = r.presets[0]!;
    const { native } = read(bytes);
    expect(dec.decode(writeOrcaUserPreset(p, { native }))).toBe(f.text);
    expect(dec.decode(writeOrcaUserPreset(p, { dialect: f.dialect }))).toBe(f.text);
  });

  test('type and setting_id in a user file are written back where its native form has them', () => {
    const text =
      '{\n\t"type": "process",\n\t"setting_id": "PS1",\n\t"name": "T",\n\t"inherits": "",\n\t"from": "User"\n}\n';
    const bytes = enc.encode(text);
    const p = readOrcaUserPresets([{ path: 'user/1/process/T.json', bytes }], { presets: [] }).presets[0]!;
    expect(dec.decode(writeOrcaUserPreset(p, { native: read(bytes).native }))).toBe(text);
  });

  test('a user preset without from, read without a native form, is written from: "User" and inherits: ""', () => {
    const r = readOrcaUserPresets(
      [{ path: 'user/1/process/P.json', bytes: enc.encode('{"name":"P","wall_loops":"2"}') }],
      { presets: [] },
    );
    expect(dec.decode(writeOrcaUserPreset(r.presets[0]!))).toBe(
      '{\n\t"from": "User",\n\t"inherits": "",\n\t"name": "P",\n\t"wall_loops": "2"\n}\n',
    );
  });
});

describe('H2C variant arrays', () => {
  const h2c = USER[1]!.text;

  test('keyed values are rebuilt to the original slot order, whatever order the keys come in', () => {
    const { values, native } = read(h2c);
    const { settings, diagnostics } = decodeVariants('machine', values);
    expect(diagnostics).toEqual([]);
    expect(settings.retraction_length).toEqual({
      0: { 'Direct Drive Standard': '0.8', 'Direct Drive High Flow': null, 'Direct Drive E3D High Flow': null },
      1: { 'Direct Drive Standard': '0.5', 'Direct Drive High Flow': null },
    });
    const shuffled = {
      ...settings,
      retraction_length: {
        1: { 'Direct Drive High Flow': null, 'Direct Drive Standard': '0.5' },
        0: { 'Direct Drive E3D High Flow': null, 'Direct Drive High Flow': null, 'Direct Drive Standard': '0.8' },
      },
    };
    expect(dec.decode(writeOrcaJson('machine', shuffled, { native }))).toBe(h2c);
    expect(dec.decode(writeOrcaJson('machine', shuffled))).toBe(h2c);
  });

  test('editing one keyed value changes one line', () => {
    const { values, native } = read(h2c);
    const { settings } = decodeVariants('machine', values);
    (settings.retraction_length as Record<string, Record<string, unknown>>)['1']!['Direct Drive Standard'] = '0.6';
    const out = dec.decode(writeOrcaJson('machine', settings, { native })).split('\n');
    const before = h2c.split('\n');
    expect(out).toHaveLength(before.length);
    expect(out.filter((l, i) => l !== before[i])).toEqual(['\t\t"0.6",']);
  });

  test('a child without its own slot lists is encoded with the flattened slots', () => {
    const { values } = read(h2c);
    const slots = decodeVariants('machine', values).settings;
    const child = { name: 'C', retraction_length: slots.retraction_length };
    expect(dec.decode(writeOrcaJson('machine', child, { slots }))).toBe(
      '{\n\t"name": "C",\n\t"retraction_length": [\n\t\t"0.8",\n\t\t"nil",\n\t\t"nil",\n\t\t"0.5",\n\t\t"nil"\n\t]\n}\n',
    );
  });
});

describe('native form', () => {
  test('numbers keep the lexeme the source used; strings stay strings', () => {
    const text = '{\n  "a" : 0.10,\n  "b": "0.20",\n  "c": [ "1", 2.50 ]\n}';
    const { values, native } = read(text);
    expect(values).toEqual({ a: 0.1, b: '0.20', c: ['1', 2.5] });
    expect(dec.decode(writeOrcaJson('process', values, { native }))).toBe(text);
    // Only the edited member is re-laid out, in the file's indent.
    expect(dec.decode(writeOrcaJson('process', { ...values, b: '0.3' }, { native }))).toBe(
      '{\n  "a" : 0.10,\n  "b": "0.3",\n  "c": [ "1", 2.50 ]\n}',
    );
  });

  test('null is "nil", in scalars and arrays; a removed member is cut, new ones are appended sorted', () => {
    const text = '{\r\n    "first": "x",\r\n    "k": ["1", "nil"],\r\n    "s": "nil"\r\n}\r\n';
    const { values, native } = read(text);
    expect(values).toEqual({ first: 'x', k: ['1', null], s: null });
    delete values.first;
    expect(dec.decode(writeOrcaJson('filament', { ...values, s: '5', z: [null], m: null }, { native }))).toBe(
      '{\r\n    "k": ["1", "nil"],\r\n    "s": "5",\r\n    "m": "nil",\r\n    "z": [\r\n        "nil"\r\n    ]\r\n}\r\n',
    );
  });

  test('a repeated key takes its last value; both occurrences are written back, only the last carries edits', () => {
    const text = '{\n\t"a": "1",\n\t"b": "2",\n\t"a": "3"\n}\n';
    const { values, native } = read(text);
    expect(values).toEqual({ a: '3', b: '2' });
    expect(dec.decode(writeOrcaJson('process', values, { native }))).toBe(text);
    expect(dec.decode(writeOrcaJson('process', { ...values, a: '4' }, { native }))).toBe(
      '{\n\t"a": "1",\n\t"b": "2",\n\t"a": "4"\n}\n',
    );
  });

  test('a key named __proto__ stays a data member', () => {
    const text = '{\n\t"__proto__": "x",\n\t"a": "1"\n}\n';
    const { values, native } = read(text);
    expect(Object.keys(values)).toEqual(['__proto__', 'a']);
    expect(dec.decode(writeOrcaJson('process', values, { native }))).toBe(text);
    expect(dec.decode(writeOrcaJson('process', values))).toBe(text);
  });

  test('an empty object, and a BOM, are kept', () => {
    expect(dec.decode(writeOrcaJson('process', {}))).toBe('{}\n');
    const text = '\uFEFF{\n\t"a": "1"\n}\n';
    const r = read(text);
    expect(writeOrcaJson('process', r.values, { native: r.native })).toEqual(enc.encode(text));
  });

  test.each([
    ['invalid UTF-8', new Uint8Array([0x7b, 0xff, 0x7d]), 'not valid JSON'],
    ['invalid JSON', enc.encode('{"a": '), 'not valid JSON'],
    ['an array', enc.encode('["a"]'), 'not a JSON object'],
    ['too deep', enc.encode(`{"a": ${'['.repeat(MAX_JSON_DEPTH + 1)}${']'.repeat(MAX_JSON_DEPTH + 1)}}`), 'deeper'],
    ['too large', new Uint8Array(TREE_LIMITS.maxFileBytes + 1), 'larger than'],
  ])('refuses %s', (_, bytes, message) => {
    const r = readOrcaJson(bytes);
    expect('error' in r && r.error).toContain(message);
  });

  test('nesting at the cap is read', () => {
    const d = MAX_JSON_DEPTH;
    expect('error' in readOrcaJson(enc.encode(`{"a": ${'['.repeat(d)}${']'.repeat(d)}}`))).toBe(false);
  });
});

const repos = fileURLToPath(new URL('../../../../.reference/repos/', import.meta.url));
const FOLDERS: Readonly<Record<string, PresetType>> = { machine: 'machine', process: 'process', filament: 'filament' };

/** Every preset file under `<vendor>/<machine|process|filament>/`, sorted. */
function presetFiles(root: string): { path: string; type: PresetType }[] {
  const out: { path: string; type: PresetType }[] = [];
  const walk = (dir: string, type: PresetType) => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, type);
      else if (e.name.endsWith('.json')) out.push({ path: p, type });
    }
  };
  for (const v of readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()))
    for (const [folder, type] of Object.entries(FOLDERS))
      if (existsSync(join(root, v.name, folder))) walk(join(root, v.name, folder), type);
  return out;
}

describe.each([
  ['OrcaSlicer@09aa0114', join(repos, 'OrcaSlicer/resources/profiles')],
  ['BambuStudio@79df7ae', join(repos, 'BambuStudio/resources/profiles')],
])('vendor presets of %s (local .reference clone)', (_, root) => {
  test.skipIf(!existsSync(root))(
    '200 sampled presets, decoded and re-encoded, export byte for byte',
    () => {
      const all = presetFiles(root);
      expect(all.length).toBeGreaterThan(1000);
      const sample = Array.from({ length: 200 }, (_, i) => all[Math.floor((i * all.length) / 200)]!);
      let variants = 0;
      for (const { path, type } of [...sample, ...all.filter((f) => /Bambu Lab H2[CD]/.test(f.path))]) {
        const bytes = readFileSync(path);
        const { values, native }: { values: Record<string, unknown>; native: OrcaJsonNative } = read(bytes);
        const t = typeof values.type === 'string' && values.type in FOLDERS ? (values.type as PresetType) : type;
        const { settings } = decodeVariants(t, values);
        if (settings.printer_extruder_variant ?? settings.print_extruder_variant) variants++;
        expect(Buffer.from(writeOrcaJson(t, settings, { native })).equals(bytes), path).toBe(true);
      }
      expect(variants).toBeGreaterThan(0);
    },
    60_000,
  );
});
