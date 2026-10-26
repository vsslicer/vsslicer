// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, truncateSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { afterAll, describe, expect, test } from 'vitest';
import { prusaCatalogue } from '../src/domain/catalogue/prusa.ts';
import { superslicerCatalogue } from '../src/domain/catalogue/superslicer.ts';
import {
  catalogueEntrySchema,
  catalogueSchema,
  defsSchema,
  orcaCatalogue,
  type CatalogueEntry,
  type Dialect,
} from '../src/index.ts';
import {
  defines,
  extractDefs,
  extractDomain,
  MAX_SOURCE_BYTES,
  readSource,
  SourceLimitError,
  substitute,
  tokenize,
} from '../tools/catalogue/cpp.ts';
import { generate, OUTPUT, outputs, PRUSA_OUTPUT, SUPERSLICER_OUTPUT } from '../tools/catalogue/generate.ts';
import {
  builtinFeatures,
  headCommit,
  PINNED,
  PRUSA3_PIN,
  PRUSA3_RENAMES,
  PRUSA_RENAMES,
  readPinned,
  REPOS,
  SUPERSLICER_ORCA,
  SUPERSLICER_RENAMES,
  uiSettings,
  vendorFeatures,
} from '../tools/catalogue/prusa.ts';

const all: [string, CatalogueEntry][] = [
  ...Object.entries(orcaCatalogue.entries),
  ...Object.entries(prusaCatalogue.entries),
  ...Object.entries(superslicerCatalogue.entries),
];
const named = (d: Dialect) => all.filter(([, e]) => e.native[d]);
const nameOf = (e: CatalogueEntry, d: Dialect) => (e.native[d] as { key: string }).key;

describe('the generated Prusa and SuperSlicer catalogues', () => {
  test('validate against catalogueSchema', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    ajv.addSchema(defsSchema).addSchema(catalogueEntrySchema);
    const valid = ajv.compile(catalogueSchema);
    for (const file of [orcaCatalogue, prusaCatalogue, superslicerCatalogue])
      expect(valid(file), JSON.stringify(valid.errors?.slice(0, 5))).toBe(true);
  });

  test('assign 396 Prusa 2.9, 445 Prusa 3.0 and 652 SuperSlicer FFF names', () => {
    expect(named('prusa')).toHaveLength(396);
    expect(named('prusa3')).toHaveLength(445);
    expect(named('superslicer')).toHaveLength(652);
    expect(Object.keys(prusaCatalogue.entries)).toHaveLength(122);
    expect(Object.keys(superslicerCatalogue.entries)).toHaveLength(279);
  });

  test('prefix keys Orca lacks with their dialect', () => {
    for (const [key, e] of Object.entries(prusaCatalogue.entries)) {
      expect(key, key).toMatch(/^prusa\./);
      expect(['prusa', 'prusa3'], key).toContain(e.native_only);
      expect(e.native[e.native_only!], key).toBeDefined();
    }
    for (const [key, e] of Object.entries(superslicerCatalogue.entries)) {
      expect(key, key).toMatch(/^superslicer\./);
      expect(e, key).toMatchObject({ native_only: 'superslicer', native: { superslicer: { key: key.slice(12) } } });
    }
    // Orca's entries keep their names and gain the others as native names only.
    for (const [key] of Object.entries(orcaCatalogue.entries)) expect(key).not.toMatch(/^(prusa|superslicer)\./);
  });

  test('give each native name one entry (3.0 hardware names keep their namespace: printer.model, feeder.model)', () => {
    for (const d of ['prusa', 'prusa3', 'superslicer'] as const) {
      const names = named(d).map(([, e]) => nameOf(e, d));
      expect(new Set(names).size, d).toBe(names.length);
    }
  });

  test('map Prusa names onto Orca names, as the rename tables say', () => {
    expect(orcaCatalogue.entries.wall_loops?.native).toMatchObject({
      orca: { key: 'wall_loops' },
      prusa: { key: 'perimeters' },
      prusa3: { key: 'perimeters', pinned: PRUSA3_PIN },
      superslicer: { key: 'perimeters' },
    });
    expect(orcaCatalogue.entries.layer_height?.native).toMatchObject({ prusa: { key: 'layer_height' } });
    for (const [prusa, r] of Object.entries(PRUSA_RENAMES))
      expect(orcaCatalogue.entries[r.to]?.native.prusa, prusa).toMatchObject({
        key: prusa,
        ...(r.lossy ? { lossy: r.lossy } : {}),
      });
    for (const [ss, r] of Object.entries(SUPERSLICER_ORCA))
      expect(orcaCatalogue.entries[r.to]?.native.superslicer, ss).toMatchObject({
        key: ss,
        ...(r.lossy ? { lossy: r.lossy } : {}),
      });
    expect(orcaCatalogue.entries.overhang_reverse_threshold?.native.superslicer).toEqual({
      key: 'overhangs_reverse_threshold',
    });
    for (const [prusa3, r] of Object.entries(PRUSA3_RENAMES))
      expect(orcaCatalogue.entries[r.to]?.native.prusa3, prusa3).toMatchObject({ key: prusa3 });
    expect(orcaCatalogue.entries.elefant_foot_compensation?.native.superslicer).toMatchObject({
      key: 'first_layer_size_compensation',
    });
  });

  test('flag a name lossy when its values do not fit the entry, or a rename says so', () => {
    const native = (key: string) => orcaCatalogue.entries[key]?.native;
    // A type the entry cannot hold.
    expect(native('gcode_label_objects')?.prusa).toEqual({
      key: 'gcode_label_objects',
      lossy: 'Prusa enum, Orca bool',
    });
    expect(native('infill_wall_overlap')?.prusa?.lossy).toBe('Prusa float_or_percent, Orca percent');
    expect(native('initial_layer_print_height')?.prusa3?.lossy).toBe('PrusaSlicer 3.0 float_or_percent, Orca float');
    // SuperSlicer flow percentages on Orca ratios.
    expect(native('bridge_flow')?.superslicer?.lossy).toBe('SuperSlicer percent (100%), Orca ratio (1.0)');
    expect(native('first_layer_flow_ratio')?.superslicer?.lossy).toBe('SuperSlicer percent (100%), Orca ratio (1.0)');
    // A Prusa rename's note carries over to SuperSlicer's same key.
    expect(native('outer_wall_speed')?.superslicer?.lossy).toBe('SuperSlicer accepts a % of perimeter_speed');
    expect(native('print_sequence')?.superslicer?.lossy).toBe('SuperSlicer bool, Orca enum by layer/by object');
    // Widening is not lossy.
    expect(native('fan_max_speed')?.prusa).toEqual({ key: 'max_fan_speed' });
    expect(prusaCatalogue.entries['prusa.max_print_speed']?.native.superslicer?.lossy).toBe(
      'SuperSlicer float_or_percent, PrusaSlicer float',
    );
  });

  test('tag every Prusa 3.0 name as pinned to PrusaSlicer@30ef591', () => {
    for (const [key, e] of named('prusa3')) expect(e.native.prusa3, key).toMatchObject({ pinned: PRUSA3_PIN });
    // The hardware namespaces: a tool feature 2.9 stores as a printer key, and features of their own.
    expect(orcaCatalogue.entries.nozzle_diameter?.native.prusa3).toEqual({
      key: 'tool.nozzle_diameter',
      pinned: PRUSA3_PIN,
    });
    expect(prusaCatalogue.entries['prusa.hw_printer_base_model']).toMatchObject({
      home: 'printer_model',
      native_only: 'prusa3',
      native: { prusa3: { key: 'printer.base_model', pinned: PRUSA3_PIN } },
    });
  });

  test('flag the 55 keys Prusa 3.0 reads only through its legacy 2.x loader', () => {
    const legacy = named('prusa3').filter(([, e]) => e.native.prusa3?.legacy);
    expect(legacy).toHaveLength(55);
    expect(orcaCatalogue.entries.compatible_printers?.native.prusa3).toEqual({
      key: 'compatible_printers',
      legacy: true,
      pinned: PRUSA3_PIN,
    });
    // Tool features that are also legacy keys are current, under their namespaced name.
    expect(prusaCatalogue.entries['prusa.nozzle_high_flow']?.native.prusa3).toEqual({
      key: 'tool.nozzle_high_flow',
      pinned: PRUSA3_PIN,
    });
  });

  // The data these lines check is ported material: Copyright (C) Prusa Research and the SuperSlicer authors,
  // AGPL-3.0 (see each file's notice).
  test('carry the AGPL notice and a provenance line on every entry', () => {
    expect(prusaCatalogue.notice).toMatch(
      /PrusaSlicer@b028299.*PrusaSlicer@30ef591.*GNU Affero General Public License v3\.0/,
    );
    expect(superslicerCatalogue.notice).toMatch(/SuperSlicer@1f3d287.*GNU Affero General Public License v3\.0/);
    for (const [key, e] of Object.entries(prusaCatalogue.entries))
      expect(e.provenance, key).toMatch(/^Ported from PrusaSlicer@(b028299|30ef591):[\w/.-]+:\d+/);
    for (const [key, e] of Object.entries(superslicerCatalogue.entries))
      expect(e.provenance, key).toMatch(/^Ported from SuperSlicer@1f3d287:src\/libslic3r\/PrintConfig\.cpp:\d+/);
  });
});

// ---- Bounds (rule 25): pinned files only, 16 MiB, linear-time scanning ----

const scratch = mkdtempSync(join(tmpdir(), 'prf16-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe('reading sources', () => {
  test('refuses a file over 16 MiB before reading it, and reads one at the limit', () => {
    const big = join(scratch, 'big.cpp');
    writeFileSync(big, '');
    truncateSync(big, MAX_SOURCE_BYTES + 1);
    expect(() => readSource(scratch, big)).toThrow(/over the 16777216-byte limit/);
    truncateSync(big, MAX_SOURCE_BYTES);
    expect(readSource(scratch, big)).toHaveLength(MAX_SOURCE_BYTES);
  });

  test('refuses a path or a link that leaves the checkout', () => {
    const root = join(scratch, 'repo');
    mkdirSync(root, { recursive: true });
    writeFileSync(join(scratch, 'outside.cpp'), 'x');
    symlinkSync(join(scratch, 'outside.cpp'), join(root, 'link.cpp'));
    expect(() => readSource(root, join(root, '../outside.cpp'))).toThrow(/outside/);
    expect(() => readSource(root, join(root, 'link.cpp'))).toThrow(/outside/);
  });

  test('refuses a checkout at another commit', () => {
    const repos = join(scratch, 'repos');
    for (const p of Object.values(PINNED)) {
      mkdirSync(join(repos, p.repo, '.git'), { recursive: true });
      writeFileSync(join(repos, p.repo, '.git/HEAD'), `${'0'.repeat(40)}\n`);
    }
    expect(() => readPinned(repos)).toThrow(/not the pinned/);
    expect(headCommit(join(repos, PINNED.prusa.repo))).toBe('0'.repeat(40));
  });
});

describe('scanning hostile input in linear time', () => {
  const wrap = (body: string) =>
    `void PrintConfigDef::init_common_params() {\n${body}\n}\nvoid PrintConfigDef::init_extruder_option_keys() {}\n`;
  const fast = (src: string, ms = 3000) => {
    const start = performance.now();
    let error: unknown;
    try {
      extractDefs(tokenize(src));
    } catch (e) {
      error = e;
    }
    expect(performance.now() - start).toBeLessThan(ms);
    return error;
  };
  const MB = 1 << 20;

  test('many unterminated block comments', () => {
    // The first one runs to the end of the file, so the functions are not found; what matters is the time.
    expect(String(fast(wrap('/*'.repeat(2 * MB))))).toMatch(/init_\* not found/);
  });

  test('an add call followed by megabytes of whitespace, and many unclosed add calls', () => {
    expect(fast(wrap(`def = this->add(${' '.repeat(4 * MB)}`))).toBeUndefined();
    expect(fast(wrap('def = this->add("k", '.repeat(200_000)))).toBeUndefined();
  });

  test('many statements without a terminator', () => {
    expect(fast(wrap(`def = this->add("k", coFloat);${' def->set_enum<X>'.repeat(200_000)}`))).toBeUndefined();
    expect(fast(wrap(`def = this->add("k", coFloat);${' def->label = '.repeat(300_000)}`))).toBeUndefined();
  });

  test('deep nesting is refused, not recursed into', () => {
    const deep = `def = this->add("k", coFloats); def->set_default_value(new ConfigOptionFloats(${'{'.repeat(100_000)}${'}'.repeat(100_000)}));`;
    expect(String(fast(wrap(deep)))).toMatch(/nesting deeper than 64/);
  });

  test('a long number, an unterminated string and many axis keys without a table', () => {
    expect(fast(wrap(`def = this->add("k", coFloat); def->min = ${'1'.repeat(4 * MB)}x;`))).toBeUndefined();
    expect(String(fast(wrap(`def->label = L("${'a'.repeat(4 * MB)}`)))).toMatch(/unterminated literal/);
    const axes = 'def = this->add("machine_max_feedrate_" + axis.name, coFloats);\n'.repeat(100_000);
    expect(String(fast(wrap(axes)))).toMatch(/axes table not found/);
  });

  test("Orca's and Bambu's path: constants, loops and lambdas", () => {
    const start = performance.now();
    const header = `${'#define X 1\n'.repeat(100_000)}#define ${'Y'.repeat(MB)} 2\n`;
    const body = `${'for (const char* key : {"a"}) { def = this->add(key, coString); } '.repeat(20_000)}${'auto f = [this](const char *key) { auto def = this->add(key, coEnum); }; '.repeat(20_000)}`;
    expect(() => generate(wrap(body), '', header)).toThrow(/list s_Preset_print_options not found/);
    expect(performance.now() - start).toBeLessThan(3000);
  });

  test('many calls of one lambda are refused before they are collected', () => {
    const src = wrap(`auto f = [](std::string k) { def = this->add(k, coFloat); };\n${'f("a");'.repeat(100_000)}`);
    const error = fast(src, 1000);
    expect(error).toBeInstanceOf(SourceLimitError);
    expect(String(error)).toMatch(/more than 64 calls/);
  });

  test('a lambda body whose arguments multiply its size is refused', () => {
    const src = wrap(
      `auto f = [](std::string k, int x) { def = this->add(k, coFloat); ${'x;'.repeat(20_000)} };\nf("a", ${'1+'.repeat(20_000)}1);`,
    );
    const error = fast(src, 1000);
    expect(error).toBeInstanceOf(SourceLimitError);
    expect(String(error)).toMatch(/expands past 65536 tokens/);
  });

  test('a #define used many times is refused before it is expanded', () => {
    const start = performance.now();
    const many = tokenize('X '.repeat(30_000));
    expect(() => substitute(many, defines(`#define X ${'1 '.repeat(30_000)}`))).toThrow(SourceLimitError);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  test("a loop's keys read its statements once, up to the loop's close", () => {
    const keys = Array.from({ length: 1024 }, (_, i) => `"k${i}"`).join(',');
    const tail = 'def->label = "x";'.repeat(100_000);
    expect(
      fast(wrap(`for (const char* k : {${keys}}) { def = this->add(k, coFloat); }\n${tail}`), 1000),
    ).toBeUndefined();
    expect(
      fast(wrap(`for (const char* k : {${keys}}) { def = this->add(k, coFloat); ${tail} }`), 1000),
    ).toBeUndefined();
    const defs = extractDefs(
      tokenize(
        wrap(
          `for (const char* k : {"a", "b"}) { def = this->add(k, coFloat); def->label = "In"; }\ndef->label = "Out";`,
        ),
      ),
    );
    expect([defs.get('a')?.label, defs.get('b')?.label]).toEqual(['In', 'In']);
  });

  test('a hostile .ui line and vendor.yaml', () => {
    const start = performance.now();
    uiSettings(`setting:${':'.repeat(4 * MB)}\n${'page:'.repeat(MB)}`, 'x.ui', () => true);
    vendorFeatures(`features:\n${'  printer:\n    x:\n      default: "\'\n'.repeat(100_000)}`);
    expect(performance.now() - start).toBeLessThan(3000);
  });
});

// ---- On the pinned sources (in .reference, ignored; without them only the committed data is checked) ----

const sources = (() => {
  try {
    return readPinned();
  } catch {
    return undefined;
  }
})();

describe.skipIf(!sources)('the generator, on the pinned PrusaSlicer and SuperSlicer checkouts', () => {
  const src = sources!;
  const file = (d: keyof typeof PINNED, f: string) => readFileSync(join(REPOS, PINNED[d].repo, f), 'utf8');

  test('is deterministic: two runs write the same files, which are the committed ones', () => {
    const first = outputs();
    const second = outputs();
    for (const path of [OUTPUT, PRUSA_OUTPUT, SUPERSLICER_OUTPUT]) {
      expect(second.get(path), path).toBe(first.get(path));
      expect(first.get(path), path).toBe(readFileSync(path, 'utf8'));
    }
  });

  // A plain scan, independent of the generator's tokenizer: every literal `add("key"` between the two functions.
  const fffKeys = (text: string, re: RegExp, from: string, to: string) => {
    const body = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
    // Keys built in loops (`"machine_max_feedrate_" + axis.name`) end in `_`; the generator expands them.
    return [...body.slice(body.indexOf(from), to ? body.indexOf(to) : undefined).matchAll(re)]
      .map((m) => m[1]!)
      .filter((k) => !k.endsWith('_'));
  };
  const assigned = (d: Dialect) => new Set(named(d).map(([, e]) => nameOf(e, d)));

  const SUPERSEDED = new Set(['nozzle_diameter', 'nozzle_high_flow']);
  test('leaves no key of the pinned lists unassigned', () => {
    const add = /this->add(?:_nullable)?\("([\w-]+)"/g;
    const lists: [Dialect, string[]][] = [
      [
        'prusa',
        fffKeys(
          src.prusa.printConfig,
          add,
          'PrintConfigDef::init_common_params()',
          'PrintConfigDef::init_extruder_option_keys()',
        ),
      ],
      [
        'superslicer',
        fffKeys(
          src.superslicer.printConfig,
          add,
          'PrintConfigDef::init_common_params()',
          'PrintConfigDef::init_extruder_option_keys()',
        ),
      ],
      [
        'prusa3',
        [
          ...fffKeys(src.prusa3.common, /defs\.add\("(\w+)"/g, '', ''),
          ...fffKeys(src.prusa3.fdm, /defs\.add\("(\w+)"/g, '', ''),
        ],
      ],
      [
        'prusa3',
        // Two legacy keys are 3.0 tool features now, named tool.nozzle_diameter and tool.nozzle_high_flow.
        fffKeys(
          src.prusa3.legacy,
          add,
          'PrintConfigDef::init_common_params()',
          'PrintConfigDef::init_extruder_option_keys()',
        ).filter((k) => !SUPERSEDED.has(k)),
      ],
      ['prusa3', vendorFeatures(src.prusa3.vendor).map((f) => `${f.ns}.${f.key}`)],
    ];
    for (const k of SUPERSEDED) expect(assigned('prusa3').has(`tool.${k}`), k).toBe(true);
    for (const [d, keys] of lists) {
      expect(keys.length, d).toBeGreaterThan(20);
      const names = assigned(d);
      for (const key of keys) expect(names.has(key), `${d}: ${key}`).toBe(true);
    }
  });

  test('names nothing the pinned sources lack, so an upstream rename fails here', () => {
    const defs = (text: string) => [...extractDefs(tokenize(text)).keys()];
    const upstream: [Dialect, Set<string>][] = [
      ['prusa', new Set(defs(src.prusa.printConfig))],
      ['superslicer', new Set(defs(src.superslicer.printConfig))],
      [
        'prusa3',
        new Set([
          ...extractDomain(tokenize(src.prusa3.common)).keys(),
          ...extractDomain(tokenize(src.prusa3.fdm)).keys(),
          ...defs(src.prusa3.legacy),
          ...vendorFeatures(src.prusa3.vendor).map((f) => `${f.ns}.${f.key}`),
          ...builtinFeatures(tokenize(src.prusa3.valueMap)).map((f) => `${f.ns}.${f.key}`),
        ]),
      ],
    ];
    for (const [d, keys] of upstream)
      for (const name of assigned(d)) expect(keys.has(name), `${d}: ${name}`).toBe(true);
  });

  test('pins each 3.0 name to the line that defines it at 30ef591', () => {
    expect(headCommit(join(REPOS, PINNED.prusa3.repo))).toMatch(/^30ef591/);
    const lines = (f: string) => file('prusa3', f).split('\n');
    const cache = new Map<string, string[]>();
    for (const [key, e] of all.filter(([, x]) => x.native.prusa3 && x.native_only === 'prusa3')) {
      const m = /PrusaSlicer@30ef591:([\w/.-]+):(\d+)/.exec(e.provenance!)!;
      if (!cache.has(m[1]!)) cache.set(m[1]!, lines(m[1]!));
      const line = cache.get(m[1]!)![Number(m[2]) - 1]!;
      // vendor.yaml nests `tool_count:` under `printer:`; ValueMapBuilder.cpp writes "printer.tool_count".
      const name = nameOf(e, 'prusa3');
      const leaf = name.slice(name.indexOf('.') + 1);
      expect(line, key).toMatch(new RegExp(`"${name}"|^\\s*${leaf}:|"\\w+\\.`));
    }
  });

  test("cites SuperSlicer's own Prusa export for each SuperSlicer rename", () => {
    const lines = file('superslicer', PINNED.superslicer.files.printConfig).split('\n');
    for (const [ss, r] of Object.entries(SUPERSLICER_RENAMES)) {
      expect(lines.slice(r.line - 3, r.line).join('\n'), ss).toContain(`"${ss}" == opt_key`);
      expect(lines[r.line - 1], ss).toContain(`opt_key = "${r.prusa}"`);
    }
  });

  test('cites the .ui page and group of SuperSlicer keys on a GUI page', () => {
    const guiKeys = Object.values(superslicerCatalogue.entries).filter((e) => e.provenance!.includes('; GUI: '));
    expect(guiKeys.length).toBeGreaterThan(150);
    for (const e of guiKeys) {
      const m = /GUI: ([\w/.]+):(\d+)/.exec(e.provenance!)!;
      expect(file('superslicer', m[1]!).split('\n')[Number(m[2]) - 1], m[0]).toContain(nameOf(e, 'superslicer'));
    }
  });

  test('extracts the same 2.9 keys from the 3.0 legacy copy, plus its six additions', () => {
    const p = extractDefs(tokenize(src.prusa.printConfig));
    const l = extractDefs(tokenize(src.prusa3.legacy));
    expect([...p.keys()].filter((k) => !l.has(k))).toEqual([]);
    expect([...l.keys()].filter((k) => !p.has(k))).toHaveLength(6);
  });
});
