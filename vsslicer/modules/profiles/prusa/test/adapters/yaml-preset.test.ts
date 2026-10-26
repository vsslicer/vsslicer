// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { MAX_YAML_DIAGNOSTICS, parseYaml } from '../../src/adapters/yaml/parse.ts';
import type { YamlMap, YamlNode, YamlStream } from '../../src/adapters/yaml/parse.ts';
import {
  MAX_PRESET_VARIANT_DEPTH,
  MAX_PRESET_VARIANTS,
  readPresetStream,
  readPresetYaml,
} from '../../src/adapters/yaml/preset.ts';
import type { PresetYamlNode } from '../../src/adapters/yaml/preset.ts';

const fx = readFileSync(join(import.meta.dirname, '../fixtures/yaml/preset-print.yaml'), 'utf8');
const on = { experimental: true };
const reasons = (d: { diagnostics: { reason: string }[] }) => d.diagnostics.map((x) => x.reason);
const js = (n: YamlNode | undefined): unknown =>
  n === undefined
    ? undefined
    : n.kind === 'scalar'
      ? n.value
      : n.kind === 'seq'
        ? n.items.map(js)
        : Object.fromEntries(n.entries.map((e) => [e.key, js(e.value)]));
const shape = (n: PresetYamlNode): unknown => ({
  id: n.id,
  condition: n.condition,
  matchMode: n.matchMode,
  values: js(n.values),
  variants: n.variants.map(shape),
});
const count = (n: PresetYamlNode): number => n.variants.reduce((a, v) => a + 1 + count(v), 0);
const depth = (n: PresetYamlNode): number => (n.variants.length ? 1 + Math.max(...n.variants.map(depth)) : 0);

describe('readPresetYaml', () => {
  test('without the flag: one diagnostic, no presets', () => {
    const d = readPresetYaml(fx, 'p.yaml');
    expect(d.presets).toEqual([]);
    expect(reasons(d)).toEqual(['experimental-off']);
  });

  test('pinned-30ef591: fixture trees nest variants with condition, id and values', () => {
    const d = readPresetYaml(fx, 'p.yaml', on);
    expect(d.diagnostics).toEqual([]);
    expect(d.presets.map((p) => [p.kind, p.id, p.line])).toEqual([
      ['print', '*base*', 1],
      ['filament', 'Demo PLA', 21],
    ]);
    expect(shape(d.presets[0]!)).toEqual({
      id: '*base*',
      condition: undefined,
      matchMode: undefined,
      values: { layer_height: '0.20' },
      variants: [
        {
          id: 'v-a',
          condition: 'printer.model == "A"',
          matchMode: 'all_matches',
          values: { perimeters: '2' },
          variants: [
            {
              id: 'v-a-04',
              condition: 'tool.nozzle_diameter == 0.4',
              matchMode: undefined,
              values: { layer_height: '0.15' },
              variants: [],
            },
            {
              id: 'v-a-06',
              condition: 'tool.nozzle_diameter == 0.6',
              matchMode: undefined,
              values: undefined,
              variants: [],
            },
          ],
        },
      ],
    });
    const f = d.presets[1]!;
    expect([f.name, f.inherits, f.unconditionalInherits, js(f.features), f.condition]).toEqual([
      'Demo PLA',
      ['*base*'],
      ['*common*'],
      { '$.type': 'PLA' },
      'printer.model == "A" and tool.nozzle_diameter >= 0.4',
    ]);
    expect(js(f.values)).toEqual({ start_filament_gcode: 'M900 K0\n; line two' });
  });

  test('bad records are diagnosed and skipped, not thrown', () => {
    const src = [
      'id: no-kind',
      '---',
      'kind: gizmo',
      '---',
      'kind: print',
      'inherits: x',
      'match_mode: sometimes',
      'values: 3',
      'variants:',
      '- just a scalar',
      '- id: ok',
    ].join('\n');
    const d = readPresetYaml(src, 'p.yaml', on);
    expect(reasons(d)).toEqual([
      'bad-record',
      'bad-record',
      'bad-record',
      'bad-record',
      'bad-record',
      'bad-record',
      'bad-record',
    ]);
    expect(d.presets.map((p) => [p.kind, p.id, p.inherits, p.variants.map((v) => v.id)])).toEqual([
      ['print', '', [], ['ok']],
    ]);
  });
});

/** A parsed stream with one root whose variants nest `levels` deep, built directly to get past MAX_YAML_DEPTH. */
function nested(levels: number): YamlStream {
  const leaf = (): YamlMap => ({ kind: 'map', entries: [], line: 1 });
  let m = leaf();
  for (let i = 0; i < levels; i++) {
    const parent = leaf();
    parent.entries.push({ key: 'variants', line: 1, value: { kind: 'seq', items: [m], line: 1 } });
    m = parent;
  }
  m.entries.unshift({ key: 'kind', line: 1, value: { kind: 'scalar', value: 'print', style: 'plain', line: 1 } });
  m.entries.unshift({ key: 'id', line: 1, value: { kind: 'scalar', value: 'r', style: 'plain', line: 1 } });
  return { documents: [{ line: 1, root: m }], diagnostics: [], stats: { nodes: 0, steps: 0 } };
}

describe('bounds', () => {
  test(`variant nesting stops at ${MAX_PRESET_VARIANT_DEPTH} levels`, () => {
    const ok = readPresetStream(nested(MAX_PRESET_VARIANT_DEPTH), 'p.yaml', on);
    expect([reasons(ok), depth(ok.presets[0]!)]).toEqual([[], MAX_PRESET_VARIANT_DEPTH]);
    const deep = readPresetStream(nested(500), 'p.yaml', on);
    expect([reasons(deep), depth(deep.presets[0]!)]).toEqual([['too-deep'], MAX_PRESET_VARIANT_DEPTH]);
  });

  test('deep variants in text hit the YAML depth limit first, as one diagnostic', () => {
    const lines = ['kind: print', 'id: r'];
    for (let i = 0; i < 40; i++) lines.push(`${'  '.repeat(i)}variants:`, `${'  '.repeat(i)}- id: v${i}`);
    const d = readPresetYaml(lines.join('\n'), 'p.yaml', on);
    expect([reasons(d), d.presets.length]).toEqual([['too-deep'], 0]);
  });

  test(`at most ${MAX_PRESET_VARIANTS} variants per file, across roots, one diagnostic`, () => {
    const doc = (k: number) =>
      ['kind: print', `id: r${k}`, 'variants:', ...Array.from({ length: 6000 }, (_, i) => `- id: v${i}`)].join('\n');
    const src = `${doc(0)}\n---\n${doc(1)}\n---\n${doc(2)}`;
    expect(parseYaml(src, 'p.yaml').diagnostics).toEqual([]);
    const d = readPresetYaml(src, 'p.yaml', on);
    expect(reasons(d)).toEqual(['too-many-variants']);
    expect(d.presets.map(count)).toEqual([6000, 4000, 0]);
  });
});

const dir = join(
  import.meta.dirname,
  '../../../../../.reference/repos/PrusaSlicer/resources/presets/prusa-research-fff/PrusaResearch',
);
const absent = 'PrusaSlicer@30ef591 is not cloned at .reference/repos/PrusaSlicer';

describe('pinned-30ef591', () => {
  test.skipIf(!existsSync(dir))(`pinned-30ef591: PrusaResearch preset golden counts (skipped when ${absent})`, () => {
    const files = readdirSync(dir).filter((f) => f.startsWith('preset-') && f.endsWith('.yaml'));
    const byType = (t: string) => files.filter((f) => f.startsWith(`preset-${t}-`)).length;
    expect({
      filament: byType('filament'),
      print: byType('print'),
      printer: byType('printer'),
      tool: byType('tool'),
    }).toEqual({
      filament: 288,
      print: 13,
      printer: 11,
      tool: 12,
    });
    const roots: Record<string, number> = {};
    let variants = 0;
    let deepest = 0;
    for (const f of files) {
      const d = readPresetYaml(readFileSync(join(dir, f)), f, on);
      expect(d.diagnostics).toEqual([]);
      for (const p of d.presets) {
        roots[p.kind] = (roots[p.kind] ?? 0) + 1;
        variants += count(p);
        deepest = Math.max(deepest, depth(p));
      }
    }
    expect(roots).toEqual({ filament: 442, print: 29, printer: 21, tool_print: 17 });
    expect({ variants, deepest }).toMatchInlineSnapshot(`
      {
        "deepest": 6,
        "variants": 9789,
      }
    `);
  });
});

describe('PRF-195: the preset reader caps its own diagnostics', () => {
  test('10,000 non-map variants give at most MAX_YAML_DIAGNOSTICS + 1 diagnostics', () => {
    const d = readPresetYaml(`kind: print\nid: x\nvariants:\n${'  - a\n'.repeat(10_000)}`, 'p.yaml', on);
    expect(d.diagnostics).toHaveLength(MAX_YAML_DIAGNOSTICS + 1);
    expect(d.diagnostics.at(-1)!.message).toBe('further diagnostics suppressed');
  });
});
