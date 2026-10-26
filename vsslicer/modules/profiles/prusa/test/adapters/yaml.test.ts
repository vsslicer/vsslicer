// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  MAX_YAML_BYTES,
  MAX_YAML_DIAGNOSTICS,
  MAX_YAML_DEPTH,
  MAX_YAML_NODES,
  MAX_YAML_SCALAR,
  parseYaml,
  yamlGet,
  yamlScalar,
} from '../../src/adapters/yaml/parse.ts';
import type { YamlNode } from '../../src/adapters/yaml/parse.ts';
import { readVendorYaml } from '../../src/adapters/yaml/vendor.ts';

const fx = readFileSync(join(import.meta.dirname, '../fixtures/yaml/vendor.yaml'), 'utf8');
const one = (src: string) => parseYaml(src, 't.yaml');
const reasons = (src: string) => one(src).diagnostics.map((d) => d.reason);
/** Plain JS view of a node, for compact assertions. */
const js = (n: YamlNode | undefined): unknown =>
  n === undefined
    ? undefined
    : n.kind === 'scalar'
      ? n.value
      : n.kind === 'seq'
        ? n.items.map(js)
        : Object.fromEntries(n.entries.map((e) => [e.key, js(e.value)]));

describe('subset reader', () => {
  test('fixture stream: documents, comment-only document, scalars kept as strings', () => {
    const s = one(fx);
    expect(s.diagnostics).toEqual([]);
    expect(s.documents.map((d) => [d.line, d.root?.kind])).toEqual([
      [1, 'map'],
      [10, 'map'],
      [20, undefined],
      [22, 'map'],
      [31, 'map'],
      [36, 'map'],
    ]);
    expect(js(s.documents[1]!.root)).toEqual({
      kind: 'printer',
      technology: 'FFF',
      name: 'Acme One',
      id: 'one',
      model: { base_model: 'ONE', model: 'ONE' },
      legacy_printer_model: ['ONE', 'ONE IS'],
      tool_count: '1',
    });
    const tool = s.documents[3]!.root;
    expect(yamlScalar(yamlGet(tool, 'condition'))).toBe('printer.base_model=~/ONE/');
    expect(yamlGet(tool, 'id')).toMatchObject({ value: '0.4', style: 'single', line: 25 });
    expect(js(yamlGet(tool, 'features'))).toEqual({ nozzle_diameter: { default: '0.4' } });
  });

  test('compact sequence at the parent column and literal block scalars', () => {
    const cfg = one(fx).documents[5]!.root;
    expect(js(yamlGet(cfg, 'tools'))).toEqual([{ tool: '0.4' }]);
    expect(yamlScalar(yamlGet(cfg, 'sheet'))).toBe('satin');
    expect(yamlScalar(yamlGet(cfg, 'start_gcode'))).toBe('M115 ; first\n  indented\n# not a comment');
    expect(yamlScalar(yamlGet(cfg, 'end_gcode'))).toBe('M84\n');
    expect(js(one('a: |+\n  x\n\nb: 1\n').documents[0]!.root)).toEqual({ a: 'x\n\n', b: '1' });
    // |+ at end of input: no extra newline from the empty line after the final \n (values from js-yaml)
    expect(js(one('a: |+\n  x\n').documents[0]!.root)).toEqual({ a: 'x\n' });
    expect(js(one('a: |+\n  x\n\n').documents[0]!.root)).toEqual({ a: 'x\n\n' });
    expect(js(one('a: |+\n  x').documents[0]!.root)).toEqual({ a: 'x\n' });
    // a whitespace-only line keeps the spaces past the content indent
    expect(js(one('a: |\n  x\n     \n  y\n').documents[0]!.root)).toEqual({ a: 'x\n   \ny\n' });
  });

  test('flow collections, quoting, escapes, empty values, nested sequences', () => {
    const root = one(
      [
        'a: {x: 1, y: [2, "3"], z: {}}',
        'b: []',
        "c: 'it''s'",
        'd: "M600\\nG1 \\u00e9 \\x41"',
        'e:',
        'f:',
        '  - - 1',
        '    - 2',
        '  - k: v',
        '    l: w',
        'g: x # trailing',
        '"q k": 1',
      ].join('\n'),
    ).documents[0]!.root;
    expect(js(root)).toEqual({
      a: { x: '1', y: ['2', '3'], z: {} },
      b: [],
      c: "it's",
      d: 'M600\nG1 é A',
      e: '',
      f: [['1', '2'], { k: 'v', l: 'w' }],
      g: 'x',
      'q k': '1',
    });
  });

  test('duplicate key warns and the first wins, as ryml find_child does', () => {
    const s = one('a: 1\na: 2\n');
    expect(s.diagnostics.map((d) => [d.reason, d.line])).toEqual([['duplicate-key', 2]]);
    expect(yamlScalar(yamlGet(s.documents[0]!.root, 'a'))).toBe('1');
  });

  test.each([
    ['a: &x 1', 'anchor'],
    ['a: *x', 'alias'],
    ['a: !!str 1', 'tag'],
    ['<<: {a: 1}', 'merge-key'],
    ['? a\n: 1', 'complex-key'],
    ['a: >\n  folded', 'folded-scalar'],
    ['a: |2\n  x', 'block-indicator'],
    ['a: [1,\n  2]', 'multi-line-flow'],
    ['a: b\n  c', 'multi-line-scalar'],
    ['a: "x', 'unterminated-quote'],
    ['a: "\\q"', 'bad-escape'],
    ['a:\n\tb: 1', 'tab-indent'],
    ['a: b: c', 'syntax'],
    ['a:\n  b: 1\n c: 2', 'syntax'],
  ])('outside the subset: %j is %s and its document is dropped', (src, reason) => {
    const s = one(src);
    expect(s.diagnostics.map((d) => d.reason)).toEqual([reason]);
    expect(s.diagnostics[0]!.severity).toBe('error');
    expect(s.documents.map((d) => d.root)).toEqual([undefined]);
  });

  test('directive and document-end markers are named, never silently accepted', () => {
    expect(reasons('%YAML 1.2\n---\na: 1\n...\n')).toEqual(['directive', 'document-end']);
  });

  test('a bad document does not stop the next one', () => {
    const s = one('a: *x\n---\nb: 1\n');
    expect(s.diagnostics.map((d) => [d.reason, d.line])).toEqual([['alias', 1]]);
    expect(js(s.documents[1]!.root)).toEqual({ b: '1' });
  });
});

describe('bounds (hostile input; counts asserted, never time)', () => {
  test('input over 8 MiB is refused unread', () => {
    const s = one('#'.repeat(MAX_YAML_BYTES + 1));
    expect(s.diagnostics.map((d) => d.reason)).toEqual(['too-large']);
    expect(s.stats).toEqual({ nodes: 0, steps: 0 });
  });

  test('invalid UTF-8 is refused', () => {
    expect(parseYaml(new Uint8Array([0x61, 0x3a, 0x20, 0xff]), 'b').diagnostics.map((d) => d.reason)).toEqual([
      'invalid-utf8',
    ]);
  });

  test('deep block nesting stops at the depth cap', () => {
    const src = Array.from({ length: 1000 }, (_, i) => `${' '.repeat(i)}k:`).join('\n');
    const s = one(src);
    expect(s.diagnostics.map((d) => d.reason)).toEqual(['too-deep']);
    expect(s.stats.nodes).toBeLessThanOrEqual(MAX_YAML_DEPTH + 1);
  });

  test('deep flow nesting stops at the depth cap', () => {
    const s = one(`a: ${'['.repeat(100_000)}${']'.repeat(100_000)}`);
    expect(s.diagnostics.map((d) => d.reason)).toEqual(['too-deep']);
    expect(s.stats.nodes).toBeLessThanOrEqual(MAX_YAML_DEPTH + 1);
  });

  test('a node flood stops at the node cap and ends the parse', () => {
    const s = one(`a: [${'1,'.repeat(MAX_YAML_NODES + 10)}]\n---\nb: 1\n`);
    expect(s.diagnostics.map((d) => d.reason)).toEqual(['too-many-nodes']);
    expect(s.stats.nodes).toBe(MAX_YAML_NODES + 1);
    expect(s.documents).toHaveLength(1);
  });

  test('a scalar over 1 MiB is refused, plain, quoted and literal', () => {
    const big = 'x'.repeat(MAX_YAML_SCALAR + 1);
    for (const src of [`a: ${big}`, `a: "${big}"`, `a: |\n  ${big}`]) {
      const s = one(src);
      expect(s.diagnostics.map((d) => d.reason)).toEqual(['scalar-too-long']);
      expect(s.stats.nodes).toBeLessThanOrEqual(2); // the document, then the one scalar
    }
  });

  test('an unterminated quote is a diagnostic, scanned once', () => {
    const s = one(`a: '${'x'.repeat(100_000)}\nb: 1\n`);
    expect(s.diagnostics.map((d) => d.reason)).toEqual(['unterminated-quote']);
    expect(s.stats.steps).toBeLessThan(2 * 100_000 + 100);
  });

  test('1 MB of indentation: steps stay linear in the input', () => {
    const pad = ' '.repeat(1024 * 1024);
    const s = one(`${pad}a: 1\n${pad}b: 2\n`);
    expect(s.diagnostics).toEqual([]);
    expect(js(s.documents[0]!.root)).toEqual({ a: '1', b: '2' });
    expect(s.stats.steps).toBeLessThan(3 * pad.length);
    // blank indentation lines and newline runs inside a literal: still one pass
    const blank = one(`a: |\n  x\n${'  \n'.repeat(300_000)}  y\n`);
    expect(blank.diagnostics).toEqual([]);
    expect(blank.stats.steps).toBeLessThan(4 * 900_000);
  });

  test('step count grows linearly with input size', () => {
    // flow, block plain with a trailing comment, and a literal block: every scanner on the hot path
    const doc = (k: number) =>
      Array.from(
        { length: k },
        (_, i) => `k${i}: [a, "b", {c: d}] # x\np${i}: plain value # c\nl${i}: |\n  lit\n  more`,
      ).join('\n');
    const a = one(doc(10_000)).stats.steps;
    const b = one(doc(20_000)).stats.steps;
    expect(b / a).toBeGreaterThan(1.9);
    expect(b / a).toBeLessThan(2.2);
  });
});

describe('vendor.yaml', () => {
  test('without the experimental flag: a diagnostic and no records', () => {
    const v = readVendorYaml(fx, 'vendor.yaml');
    expect(v.diagnostics.map((d) => [d.reason, d.code])).toEqual([['experimental-off', 'unknown-type']]);
    expect([v.vendor, v.printers, v.printerConfigs, v.tools, v.feeders, v.sheets]).toEqual([
      undefined,
      [],
      [],
      [],
      [],
      [],
    ]);
  });

  test('fixture records by kind', () => {
    const v = readVendorYaml(fx, 'vendor.yaml', { experimental: true });
    expect(v.diagnostics).toEqual([]);
    expect(v.vendor?.id).toBe('Acme');
    expect([v.printers, v.printerConfigs, v.tools, v.feeders, v.sheets].map((g) => g.map((r) => r.id))).toEqual([
      ['one'],
      ['one-1t'],
      ['0.4'],
      [],
      ['satin'],
    ]);
  });

  test('unknown kind, missing kind, missing id and duplicate ids are warned', () => {
    const v = readVendorYaml(
      'kind: gadget\n---\nid: x\n---\nkind: tool\n---\nkind: sheet\nid: s\n---\nkind: sheet\nid: s\n',
      'v',
      {
        experimental: true,
      },
    );
    expect(v.diagnostics.map((d) => [d.reason, d.line])).toEqual([
      ['bad-record', 1],
      ['bad-record', 2],
      ['bad-record', 4],
      ['bad-record', 9],
    ]);
    expect(v.tools.map((t) => t.id)).toEqual(['']);
    expect(v.sheets).toHaveLength(1);
  });
});

const presets = join(import.meta.dirname, '../../../../../.reference/repos/PrusaSlicer/resources/presets');
const vendorFile = join(presets, 'prusa-research-fff/PrusaResearch/vendor.yaml');
const absent = 'PrusaSlicer@30ef591 is not cloned at .reference/repos/PrusaSlicer';

describe('pinned-30ef591', () => {
  test.skipIf(!existsSync(vendorFile))(`pinned-30ef591: vendor.yaml golden counts (skipped when ${absent})`, () => {
    const v = readVendorYaml(readFileSync(vendorFile), vendorFile, { experimental: true });
    expect(v.diagnostics).toEqual([]);
    expect(v.vendor?.id).toBe('PrusaResearch');
    expect({
      printers: v.printers.length,
      printerConfigs: v.printerConfigs.length,
      tools: v.tools.length,
      feeders: v.feeders.length,
      sheets: v.sheets.length,
    }).toEqual({ printers: 17, printerConfigs: 32, tools: 10, feeders: 3, sheets: 6 });
  });

  test.skipIf(!existsSync(presets))(
    `pinned-30ef591: every pinned .yaml reads without a diagnostic (skipped when ${absent})`,
    () => {
      const files = readdirSync(presets, { recursive: true })
        .map(String)
        .filter((f) => f.endsWith('.yaml'));
      expect(files).toHaveLength(325);
      const bad = files.flatMap((f) => parseYaml(readFileSync(join(presets, f)), f).diagnostics);
      expect(bad).toEqual([]);
    },
  );
});

describe('SP9 audit findings 3 and 9: bounds', () => {
  test('bare --- documents count against the node cap (PRF-196)', () => {
    const s = parseYaml('---\n'.repeat(MAX_YAML_NODES + 100), 'x.yaml');
    expect(s.stats.nodes).toBe(MAX_YAML_NODES + 1);
    expect(s.documents.length).toBeLessThanOrEqual(MAX_YAML_NODES);
    expect(s.diagnostics.map((d) => d.reason)).toContain('too-many-nodes');
  });

  test('the vendor reader caps its own diagnostics (PRF-195)', () => {
    const d = readVendorYaml('---\na: 1\n'.repeat(5000), 'v.yaml', { experimental: true });
    expect(d.diagnostics).toHaveLength(MAX_YAML_DIAGNOSTICS + 1);
    expect(d.diagnostics.at(-1)!.message).toBe('further diagnostics suppressed');
  });
});
