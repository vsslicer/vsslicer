// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { compileRegex } from '../src/domain/conditions/evaluate/regex.ts';
import { MAX_REGEX_STATES, MAX_SUBJECT_LENGTH, evaluate, type ConditionContext } from '../src/index.ts';

const ctx: ConditionContext = {
  printer: {
    model: 'MK4S',
    id: 'mk4s',
    single_extruder_multi_material: false,
    tags: ['PRUSA', 'ENCLOSED'],
    features: { chamber: true },
  },
  nozzle: { diameter: 0.6, flow: 'high_flow', high_flow: true },
  surface: { kind: 'textured' },
  feeder: { base_model: 'MMU3', single_mode: false },
  material: { type: 'PETG', temp: 240 },
  process: { layer_height: 0.2 },
};
const ok = (src: string) => {
  const r = evaluate(src, ctx);
  expect(r.diagnostic, src).toBeUndefined();
  return r.compatible;
};
const bad = (src: string, re: RegExp) => {
  const r = evaluate(src, ctx);
  expect(r.compatible).toBe(true);
  expect(r.diagnostic).toMatch(re);
};

describe('operators', () => {
  test.each([
    ['nozzle.diameter == 0.6', true],
    ['nozzle.diameter != 0.6', false],
    ['nozzle.diameter < 0.8', true],
    ['nozzle.diameter <= 0.6', true],
    ['nozzle.diameter > 0.6', false],
    ['nozzle.diameter >= 0.6', true],
    ["nozzle.flow == 'high_flow'", true],
    ['printer.model =~ /MK4S|MK3.9S/', true],
    ['printer.model =~ /MK4/', false], // full match, as regex_match
    ['printer.model =~ /MK.*/', true],
    ['printer.model !~ /XL/', true],
    ["printer.id in ['mk4s', 'xl']", true],
    ["printer.id not in ['mk4s']", false],
    ["'PRUSA' in printer.tags", true],
    ["'MMU' not in printer.tags", true],
    ['printer.features.chamber', true],
    ['not printer.features.chamber', false],
    ['! printer.single_extruder_multi_material', true],
    ['nozzle.high_flow and material.temp > 200', true],
    ['nozzle.diameter == 0.4 or material.type == "PETG"', true],
    ['(nozzle.diameter == 0.4 or nozzle.diameter == 0.6) and not feeder.single_mode', true],
    ['surface.kind == "textured" and process.layer_height < 0.3', true],
    ['feeder.base_model =~ /.*MMU.*/ and ! feeder.single_mode', true],
  ])('%s -> %s', (src, want) => expect(ok(src)).toBe(want));
});

describe('failure semantics: compatible + diagnostic, never throws', () => {
  test('parse failure', () => bad('nozzle.diameter ==', /offset/));
  test.each([
    ['printer.single_extruder_multi_material and nozzle.nope', /Unknown key/],
    ['nozzle.nope and printer.single_extruder_multi_material', /Unknown key/],
    ['nozzle.high_flow or nozzle.nope', /Unknown key/],
    ['nozzle.nope or nozzle.high_flow', /Unknown key/],
    ['printer.single_extruder_multi_material and nozzle.diameter', /Not a boolean/],
    ['nozzle.diameter and printer.single_extruder_multi_material', /Not a boolean/],
  ])('and/or evaluate both sides, either order: %s', (src, re) => bad(src, re));
  test('unknown key', () => bad('nozzle.nope == 1', /Unknown key 'nozzle.nope'/));
  test('missing namespace in context', () => expect(evaluate('printer.model == "x"', {}).compatible).toBe(true));
  test('type mismatch', () => bad('nozzle.diameter == "0.6"', /Cannot compare number with string/));
  test('ordering on strings', () => bad('nozzle.flow < "z"', /needs numbers/));
  test('non-boolean truth test', () => bad('nozzle.diameter', /Not a boolean/));
  test('regex on number', () => bad('nozzle.diameter =~ /0/', /needs a string/));
  test('in over non-list', () => bad("'a' in printer.model", /Expected a list/));
  test('object where scalar expected', () => bad('printer.features == 1', /scalar/));
  test('prototype keys are not keys', () => bad('printer.constructor == 1', /Unknown key/));
});

describe('regex engine', () => {
  const a512 = 'a'.repeat(MAX_SUBJECT_LENGTH);
  const alt = (x: string, k: number) => `(?:${Array(k).fill(x).join('|')})`;
  const match = (p: string, s: string) => evaluate(`material.name =~ /${p}/`, { material: { name: s } });
  // Machine-independent bound: every NFA state is visited at most once per position, each visit costs a constant
  // number of steps (pops of the closure stack, at most two pushes per split, plus the char-state loop): 4 is generous.
  const expectLinear = (p: string, s: string) => {
    const stats = { states: 0, steps: 0 };
    compileRegex(p)(s, stats);
    expect(stats.steps).toBeLessThanOrEqual(4 * stats.states * (s.length + 1));
  };
  // Patterns that backtrack catastrophically in RegExp, plus the reviewers' probes; expected values worked by hand.
  test.each([
    ['(a+)+$', 'a'.repeat(60) + '!', false],
    ['(a|a)*', a512, true],
    ['(\\w+\\s?)*', 'a'.repeat(511) + '!', false],
    ['(a*)*b', a512, false],
    ['((a)+)+b', a512, false],
    ['(?:(?:a)+)+b', a512, false],
    ['a*a*a*a*a*a*a*a*b', a512, false],
    ['(a?){28}a{28}', 'a'.repeat(28), true],
    ['(.*)?(.*)?(.*)?b', a512, false],
    ['(a|a){21}', a512, false],
    ['(a|a){21}b', 'a'.repeat(30), false],
    ['.*.*b', a512, false],
    ['.*.*a{999}b', a512, false],
    ['.*.*a{300}b', a512, false],
    ['.*.*a{170}b', a512, false],
    [alt('.*.*a{170}b', 13), a512, false],
    [alt('.*.*a{170}', 13), a512, true],
    ['(?:(?:a|a)?){20}b', a512, false],
    ['[a-z]*[a-z]*b', a512, false],
    ['(?:a*)?(?:a*)?b', a512, false],
    ['(?:a{0,512}){2}b', a512, false],
    ['(?:a{0,512}){2}', a512, true],
    [alt('(?:a|a){11}a*b', 1), a512, false],
  ])('%s runs in linear time with the right answer', (p, s, want) => {
    expect(match(p, s)).toEqual({ compatible: want });
    expectLinear(p, s);
  });
  test('multi-line printer_notes match as PrusaSlicer (Boost) does', () => {
    const notes = "Don't remove the following keywords!\nPRINTER_VENDOR_PRUSA3D\nPRINTER_MODEL_MK4S\n";
    const r = evaluate('printer.notes =~ /.*PRINTER_VENDOR_PRUSA3D.*/', { printer: { notes } });
    expect(r).toEqual({ compatible: true });
  });
  // Boost line breaks are \n \r \f, never inside \r\n; JavaScript's `m` differs on \f, \u2028 and the \r\n middle.
  test.each([
    ['a.b', 'a\nb', true],
    ['a$\\s^b', 'a\nb', true],
    ['a$\\s^b', 'a\fb', true],
    ['a$\\s^b', 'a\rb', true],
    ['a\\s$\\s^b', 'a\r\nb', false],
    ['a$\\s\\s^b', 'a\r\nb', true],
    ['a$\\s^b', 'a\u2028b', false],
    ['a.$', 'a\n', true],
  ])('%s on %j is %s', (p, s, want) => expect(match(p, s)).toEqual({ compatible: want }));
  test.each(['(a)\\1', '(?=a)a', '(?<n>a)', '\\p{L}', '(?:(?:a){1000}){1000}', '(){999999999}b', '.{5001}'])(
    'rejects %s instantly with a diagnostic',
    (p) => {
      const r = match(p, 'a');
      expect(r.compatible).toBe(true);
      expect(r.diagnostic).toMatch(/Regex rejected/);
    },
  );
  test('invalid syntax is a diagnostic', () =>
    expect(match('a{2,1}', 'a').diagnostic).toMatch(/Invalid regular expression/));
  test.each([
    `(?:.?){${Math.floor(MAX_REGEX_STATES / 3)}}`,
    `(?:[a-z]|\\w|.|a)*(?:.?){${Math.floor(MAX_REGEX_STATES / 3) - 6}}`,
  ])('the largest NFA admitted does linear work on a max-length subject: %s', (p) => {
    expect(match(p, a512).diagnostic).toBeUndefined();
    expectLinear(p, a512);
  });

  // Boost's full match as RegExp, for subjects whose only line break is \n: `s` and `m` (Boost's defaults), sticky
  // at 0 and `(?![^])` at the very end, since `^`/`$` would also match at line breaks.
  const boostLike = (p: string) => {
    const re = new RegExp(`(?:${p})(?![^])`, 'msuy');
    return (s: string) => ((re.lastIndex = 0), re.test(s));
  };
  const lines = (f: string) =>
    readFileSync(new URL(f, import.meta.url), 'utf8')
      .split('\n')
      .filter((l) => !l.startsWith('#'));
  const pats = lines('conditions-vendor-regexes.txt').filter(Boolean);
  const subjects = lines('conditions-vendor-subjects.txt').map((l) => l.replaceAll('\\n', '\n'));
  test('every vendor profile regex matches exactly as RegExp on real and random subjects', () => {
    expect(pats.length).toBeGreaterThan(150);
    let seed = 99;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    let positives = 0;
    for (const p of pats) {
      const re = boostLike(p);
      const chars = [...new Set(p + 'aZ09_ \n.@-')];
      const own = [...subjects];
      for (let k = 0; k < 40; k++) {
        let s = '';
        for (let j = Math.floor(rnd() * 30); j > 0; j--) s += chars[Math.floor(rnd() * chars.length)];
        own.push(s);
      }
      for (const s of own) {
        const r = match(p, s);
        expect(r.diagnostic, p).toBeUndefined();
        expect(r.compatible, `${p} on ${JSON.stringify(s)}`).toBe(re(s));
        if (r.compatible) positives++;
      }
    }
    expect(positives).toBeGreaterThan(500); // the comparison covers matches, not only misses
  }, 60_000); // hang guard only; the loop is heavy under load
  test('random patterns match exactly as RegExp on short subjects', () => {
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const pick = <T>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)]!;
    const atoms = ['a', 'b', '.', '[ab]', '[^a]', '\\d', '\\w', '\\s', '\\.', 'é', '😀'];
    const quants = ['', '', '?', '*', '+', '{2}', '{0,2}', '{1,}', '*?', '+?'];
    const gen = (d: number): string => {
      const n = 1 + Math.floor(rnd() * 3);
      let s = '';
      for (let k = 0; k < n; k++) {
        const r = rnd();
        if (r < 0.1) s += pick(['^', '$', '\\b', '\\B']);
        else if (r < 0.3 && d < 3) s += pick(['(', '(?:']) + gen(d + 1) + (rnd() < 0.4 ? '|' + gen(d + 1) : '') + ')';
        else s += pick(atoms);
        if (!/[$^]$|\\[bB]$/.test(s)) s += pick(quants);
      }
      return s;
    };
    const alphabet = ['a', 'b', '1', ' ', '_', '.', '\n', 'é', '😀'];
    for (let i = 0; i < 2000; i++) {
      const p = gen(0);
      const re = boostLike(p); // the alphabet's only line break is \n
      for (let k = 0; k < 10; k++) {
        let s = '';
        for (let j = Math.floor(rnd() * 8); j > 0; j--) s += pick(alphabet);
        expect(match(p, s), `${p} on ${JSON.stringify(s)}`).toEqual({ compatible: re(s) });
      }
    }
  });
  test('overlong subject and pattern', () => {
    expect(evaluate('printer.model =~ /a/', { printer: { model: 'a'.repeat(600) } }).diagnostic).toMatch(/subject/);
    expect(evaluate(`printer.model =~ /${'a'.repeat(250)}/`, ctx).diagnostic).toMatch(/Regex longer/);
  });
});

describe('fuzz', () => {
  const toks = [
    'printer.model',
    'nozzle.diameter',
    'nozzle.nope',
    'feeder.single_mode',
    'printer.tags',
    '0.6',
    '"x"',
    "'MK4S'",
    '==',
    '!=',
    '<',
    '>=',
    '=~',
    '!~',
    '/(a+)+$/',
    '/M.*/',
    'and',
    'or',
    'not',
    '!',
    'in',
    '[',
    ']',
    '(',
    ')',
    ',',
    '/',
    '\\',
    "'",
    'æ',
    '-',
    '.',
  ];
  test('10 000 random inputs never throw', () => {
    let seed = 12345;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 10_000; i++) {
      const n = 1 + Math.floor(rnd() * 12);
      let s = '';
      for (let j = 0; j < n; j++) s += toks[Math.floor(rnd() * toks.length)] + (rnd() < 0.8 ? ' ' : '');
      const r = evaluate(s, ctx);
      expect(typeof r.compatible).toBe('boolean');
    }
  });
});
