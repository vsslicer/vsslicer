// SPDX-License-Identifier: AGPL-3.0-or-later
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { ConditionParseError, NAMESPACES, parseCondition, type Expr } from '../src/index.ts';

/** Compact S-expression of the AST, so precedence is readable in assertions. */
const show = (e: Expr): string => {
  switch (e.kind) {
    case 'literal':
      return JSON.stringify(e.value);
    case 'ref':
      return `${e.namespace}.${e.path.join('.')}`;
    case 'compare':
      return `(${e.op} ${show(e.left)} ${show(e.right)})`;
    case 'match':
      return `(${e.negated ? '!~' : '=~'} ${show(e.subject)} /${e.pattern}/)`;
    case 'in':
      return `(${e.negated ? 'not-in' : 'in'} ${show(e.item)} ${Array.isArray(e.set) ? `[${e.set.map(show).join(' ')}]` : show(e.set)})`;
    case 'not':
      return `(not ${show(e.operand)})`;
    case 'and':
    case 'or':
      return `(${e.kind} ${show(e.left)} ${show(e.right)})`;
  }
};
const p = (src: string) => show(parseCondition(src));
const err = (src: string): ConditionParseError => {
  try {
    parseCondition(src);
  } catch (e) {
    if (e instanceof ConditionParseError) return e;
    throw e;
  }
  throw new Error(`parsed: ${src}`);
};

describe('real conditions from docs/research/profiles.md', () => {
  test('§6 override example (profiles.md:230)', () => {
    expect(p("nozzle.diameter == 0.6 and nozzle.flow == 'high_flow'")).toBe(
      '(and (== nozzle.diameter 0.6) (== nozzle.flow "high_flow"))',
    );
  });
  test('PrusaSlicer 3.0 feeder form parses as written (profiles.md:77)', () => {
    expect(p('feeder.base_model=~/.*MMU.*/ and ! feeder.single_mode')).toBe(
      '(and (=~ feeder.base_model /.*MMU.*/) (not feeder.single_mode))',
    );
  });
  test('PrusaResearch.ini:8593 translated (profiles.md:47, :237)', () => {
    expect(
      p(
        'printer.model=~/(MK4S|MK4SMMU3|MK3.9S|MK3.9SMMU3)/ and nozzle.diameter!=0.8 and nozzle.diameter!=0.6 and ! printer.single_extruder_multi_material',
      ),
    ).toBe(
      '(and (and (and (=~ printer.model /(MK4S|MK4SMMU3|MK3.9S|MK3.9SMMU3)/) (!= nozzle.diameter 0.8)) (!= nozzle.diameter 0.6)) (not printer.single_extruder_multi_material))',
    );
  });
  test('the untranslated Prusa form is rejected: no namespace, no indexing (profiles.md:47)', () => {
    expect(err('printer_model=~/(MK4S)/ and nozzle_diameter[0]!=0.8').message).toMatch(
      /Unknown reference 'printer_model'/,
    );
  });
  test('conversion table forms (profiles.md:237-242)', () => {
    expect(p("printer.model == 'MK4'")).toBe('(== printer.model "MK4")');
    expect(p("'TAG' in printer.tags")).toBe('(in "TAG" printer.tags)');
    expect(p("printer.id in ['a', 'b']")).toBe('(in printer.id ["a" "b"])');
    expect(p("printer.model == 'X' and nozzle.id == 'AA 0.4' and material.base == 'generic_pla'")).toBe(
      '(and (and (== printer.model "X") (== nozzle.id "AA 0.4")) (== material.base "generic_pla"))',
    );
    expect(p("material.base not in ['generic_pla', 'generic_abs']")).toBe(
      '(not-in material.base ["generic_pla" "generic_abs"])',
    );
  });
});

describe('grammar', () => {
  test('every namespace parses, with nested paths', () => {
    for (const ns of NAMESPACES) expect(p(`${ns}.a.b`)).toBe(`${ns}.a.b`);
  });
  test('every comparison operator', () => {
    for (const op of ['==', '!=', '<', '<=', '>', '>='])
      expect(p(`process.layer_height ${op} 0.2`)).toBe(`(${op} process.layer_height 0.2)`);
  });
  test('literals: numbers, both quotes with escapes, booleans', () => {
    expect(p('surface.x == -1.5e2')).toBe('(== surface.x -150)');
    expect(p('surface.x == .5')).toBe('(== surface.x 0.5)');
    expect(p(`surface.x == "a\\"b"`)).toBe('(== surface.x "a\\"b")');
    expect(p(`surface.x != 'it\\'s'`)).toBe(`(!= surface.x "it's")`);
    expect(p('true')).toBe('true');
    expect(p('printer.features.chamber == false')).toBe('(== printer.features.chamber false)');
  });
  test('regex match and non-match, escaped slash stays in the pattern', () => {
    expect(p('printer.model !~ /MK3/')).toBe('(!~ printer.model /MK3/)');
    expect(p('printer.model =~ /a\\/b/')).toBe('(=~ printer.model /a\\/b/)');
  });
  test('in: empty list, numbers, negated', () => {
    expect(p('nozzle.diameter in []')).toBe('(in nozzle.diameter [])');
    expect(p('nozzle.diameter in [0.4, 0.6]')).toBe('(in nozzle.diameter [0.4 0.6])');
    expect(p('nozzle.diameter not in [0.8]')).toBe('(not-in nozzle.diameter [0.8])');
  });
  test('precedence: not > and > or, left-associative', () => {
    expect(p('printer.a or printer.b and printer.c')).toBe('(or printer.a (and printer.b printer.c))');
    expect(p('printer.a and printer.b or printer.c')).toBe('(or (and printer.a printer.b) printer.c)');
    expect(p('not printer.a and printer.b')).toBe('(and (not printer.a) printer.b)');
    expect(p('not printer.a or not printer.b')).toBe('(or (not printer.a) (not printer.b))');
    expect(p('printer.a or printer.b or printer.c')).toBe('(or (or printer.a printer.b) printer.c)');
    expect(p('not not printer.a')).toBe('(not (not printer.a))');
  });
  test('comparison binds tighter than not; parentheses override', () => {
    expect(p('not nozzle.d == 1')).toBe('(not (== nozzle.d 1))');
    expect(p('(printer.a or printer.b) and printer.c')).toBe('(and (or printer.a printer.b) printer.c)');
    expect(p('not (printer.a and printer.b)')).toBe('(not (and printer.a printer.b))');
  });
  test('nodes carry their source offset', () => {
    const e = parseCondition('printer.a and  nozzle.b == 1');
    expect(e).toMatchObject({ kind: 'and', offset: 10, right: { kind: 'compare', offset: 15 } });
  });
});

describe('errors carry an offset and a message', () => {
  test.each([
    ['printer.model = 1', 14, /Assignment/],
    ['printer.f(1)', 0, /Function calls are not allowed/],
    ['printer.a ==', 12, /Expected a value .* found the end/],
    ['printer.a and', 13, /Expected a value/],
    ['(printer.a', 10, /Expected '\)'/],
    ['printer.a printer.b', 10, /Expected 'and', 'or' or the end/],
    ['printer.a == 1 == 2', 15, /Expected 'and', 'or'/],
    ["printer.a == 'x", 13, /Unterminated string/],
    ["printer.a == 'x\\q'", 15, /Unknown escape/],
    ['printer.a =~ /x', 13, /Unterminated regular expression/],
    ['printer.a =~ /(/', 13, /Invalid regular expression/],
    ['printer.a =~ printer.b', 13, /Expected a \/regex\//],
    ['printer.a / 2', 10, /Unexpected character '\/'/],
    ['printer.a in [printer.b]', 14, /a literal in the list/],
    ['printer.a in [1 2]', 16, /',' or '\]'/],
    ['printer.a in 1', 13, /'\[' or a reference/],
    ['tool.nozzle_diameter == 0.4', 0, /Unknown reference 'tool.nozzle_diameter'/],
    ['printer == 1', 0, /Unknown reference 'printer'/],
    ['and', 0, /Expected a value/],
    ['', 0, /Expected a value .* the end/],
    ['printer.a; printer.b', 9, /Unexpected character ';'/],
  ])('%s', (src, offset, message) => {
    const e = err(src);
    expect(e.offset).toBe(offset);
    expect(e.message).toMatch(message);
  });
});

test('the conditions code has no eval, Function or dynamic import', () => {
  const dir = join(import.meta.dirname, '../src/domain/conditions');
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts'));
  expect(files.length).toBeGreaterThan(0);
  for (const f of files) {
    const code = readFileSync(join(dir, f), 'utf8');
    expect(code, f).not.toMatch(/\beval\s*\(|\bFunction\s*\(|\bimport\s*\(/);
  }
});

describe('limits on untrusted input', () => {
  const t = 'printer.x';
  test.each([
    ['5000 nested parentheses', '('.repeat(5000) + 'true' + ')'.repeat(5000)],
    ['20000 not', 'not '.repeat(20000) + 'true'],
    ['20000 bang', '!'.repeat(20000) + 'true'],
    ['1M chained and (over the length cap)', Array(1_000_000).fill(t).join(' and ')],
    ['100 chained and (over the height cap)', Array(100).fill(t).join(' and ')],
  ])('%s throws ConditionParseError with an offset', (_n, src) => {
    try {
      parseCondition(src);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ConditionParseError);
      expect(typeof (e as ConditionParseError).offset).toBe('number');
    }
  });
  test('moderate nesting and chains still parse', () => {
    expect(() => parseCondition('('.repeat(30) + 'printer.x' + ')'.repeat(30))).not.toThrow();
    expect(() => parseCondition(Array(50).fill(t).join(' or '))).not.toThrow();
  });
});
