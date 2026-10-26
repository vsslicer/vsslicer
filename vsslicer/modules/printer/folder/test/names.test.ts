// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test, vi } from 'vitest';
import {
  MAX_ENTRIES,
  MAX_INPUT_LENGTH,
  MAX_LONG_NAME,
  sanitiseAll,
  sanitiseName,
  uniqueName,
} from '../src/domain/names.ts';

const FAT = /^[A-Z0-9!#$%&'()\-@^_`{}~]{1,8}(\.[A-Z0-9!#$%&'()\-@^_`{}~]{1,3})?$/;
const RESERVED = /^(CON|PRN|AUX|NUL|(COM|LPT)[0-9\u00b9\u00b2\u00b3])$/i;
const long = { longFilenames: true };

// Small seeded PRNG: deterministic "property" runs without a dependency (fast-check is not installed).
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const ALPHABET = [
  ...'abcXYZ019 ._-~!#$%&\'()@^`{}<>:"/\\|?*\t\u0000',
  'é',
  'ß',
  'ü',
  '́',
  '日',
  '本',
  '😀',
  '\ud83d',
  '\ude00',
  '�',
  'CON',
  'aux',
  'com1',
  'lpt9',
  'NUL',
  '.gcode',
  '.3mf',
];
function pickStr(r: () => number, chars: string, min: number, max: number): string {
  const len = min + Math.floor(r() * (max - min + 1));
  return Array.from({ length: len }, () => chars[Math.floor(r() * chars.length)]).join('');
}
function randomName(r: () => number): string {
  const len = Math.floor(r() * 40);
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(r() * ALPHABET.length)];
  return s;
}

describe('examples (8.3)', () => {
  test.each([
    ['benchy.gcode', 'BENCHY.GCO'],
    ['Benchy.gcode.3mf', 'BENCHY_G.3MF'],
    ['résumé.gcode', 'RESUME.GCO'],
    ['日本語.gcode', '___.GCO'],
    ['name. . .', 'NAME'],
    ['trailing space .gcode ', 'TRAILING.GCO'],
    ['.hidden', 'HIDDEN'],
    ['', 'FILE'],
    ['...', 'FILE'],
    ['a b+c,d.gcode', 'A_B_C_D.GCO'],
    ['CON', 'CON_'],
    ['con.gcode', 'CON_.GCO'],
    ['COM1.txt', 'COM1_.TXT'],
    ['LPT9', 'LPT9_'],
    ['nul.tar.gz', 'NUL_TAR.GZ'],
    ['é.gcode', 'E.GCO'],
    ['😀.gcode', '__.GCO'],
  ])('%j -> %j', (input, out) => {
    expect(sanitiseName(input)).toBe(out);
  });
});

describe('examples (long names)', () => {
  test.each([
    ['Benchy.gcode.3mf', 'Benchy.gcode.3mf'],
    ['日本語 résumé.gcode', '日本語 résumé.gcode'],
    ['a<b>c:d"e/f\\g|h?i*j.gcode', 'a_b_c_d_e_f_g_h_i_j.gcode'],
    ['name. . .', 'name'],
    ['  lead.gcode', 'lead.gcode'],
    ['con.gcode', '_con.gcode'],
    ['NUL', '_NUL'],
    ['..', 'file'],
    ['é.gcode', 'é.gcode'],
  ])('%j -> %j', (input, out) => {
    expect(sanitiseName(input, long)).toBe(out);
  });

  test('255 units kept, longer cut with the extension preserved and no split surrogate', () => {
    const exact = `${'a'.repeat(250)}.3mf`.slice(0, MAX_LONG_NAME);
    expect(sanitiseName(exact, long)).toBe(exact);
    const cutName = sanitiseName(`${'😀'.repeat(200)}.gcode.3mf`, long);
    expect(cutName.length).toBeLessThanOrEqual(MAX_LONG_NAME);
    expect(cutName.endsWith('.3mf')).toBe(true);
    expect(cutName).not.toMatch(/[\ud800-\udbff](?![\udc00-\udfff])/);
  });
});

describe('collisions', () => {
  test('~n suffixing in 8.3, case-insensitive', () => {
    expect(sanitiseAll(['Benchy.gcode', 'BENCHY.GCO', 'benchy.gco', 'longname1.gcode', 'longname2.gcode'])).toEqual([
      'BENCHY.GCO',
      'BENCHY~1.GCO',
      'BENCHY~2.GCO',
      'LONGNAME.GCO',
      'LONGNA~1.GCO',
    ]);
  });
  test('long mode suffixes and stays within 255', () => {
    const big = `${'x'.repeat(300)}.gcode`;
    const [a, b] = sanitiseAll([big, big], long);
    expect(a).not.toBe(b);
    expect(b!.length).toBeLessThanOrEqual(MAX_LONG_NAME);
    expect(b!.endsWith('~1.gcode')).toBe(true);
  });
  test('uniqueName avoids names already on the target', () => {
    expect(uniqueName('a.gcode', ['A.GCO'])).toBe('A~1.GCO');
    expect(uniqueName('a.gcode', ['B.GCO'])).toBe('A.GCO');
  });
});

describe('collision edge cases', () => {
  const lone = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;
  test('long extensions never push a suffixed name past 255 or split a pair', () => {
    for (const ext of ['x'.repeat(253), '😀'.repeat(126), 'x'.repeat(250)]) {
      for (const count of [3, 1200]) {
        const out = sanitiseAll(
          Array.from({ length: count }, () => `a.${ext}`),
          long,
        );
        expect(new Set(out.map((o) => o.toUpperCase().toLowerCase())).size).toBe(count);
        for (const o of out) {
          expect(o.length).toBeLessThanOrEqual(MAX_LONG_NAME);
          expect(o).not.toMatch(lone);
        }
      }
    }
  });
  test('names the target upcases together collide (final sigma)', () => {
    const out = sanitiseAll(['aς.gcode', 'aσ.gcode', 'aΣ.gcode'], long);
    expect(new Set(out.map((o) => o.toUpperCase().toLowerCase())).size).toBe(3);
    expect(uniqueName('aσ.gcode', ['aς.gcode'], long)).not.toBe('aσ.gcode');
  });
  test('Win32 reserved forms in long mode', () => {
    for (const n of ['con .gcode', 'COM\u00b9', 'COM\u00b2.txt', 'COM\u00b3', 'COM0', 'lpt0.gcode']) {
      expect(sanitiseName(n, long)).toMatch(/^_/);
    }
    expect(sanitiseName('COM0')).toBe('COM0_');
  });
});

describe('properties (seeded random, 8.3)', () => {
  const r = rng(42);
  const inputs = Array.from({ length: 3000 }, () => randomName(r));

  test('valid 8.3, never reserved, idempotent', () => {
    for (const i of inputs) {
      const o = sanitiseName(i);
      expect(o).toMatch(FAT);
      expect(o.split('.')[0]).not.toMatch(RESERVED);
      expect(sanitiseName(o)).toBe(o);
    }
  });
  test('extension preserved (as its first three valid characters) when the input has one', () => {
    for (const ext of ['gcode', 'gco', '3mf', 'g', 'bgcode']) {
      expect(sanitiseName(`model.${ext}`).split('.')[1]).toBe(ext.toUpperCase().slice(0, 3));
    }
  });
  test('random extension preserved as its first three characters', () => {
    const q = rng(11);
    for (let i = 0; i < 1000; i++) {
      const base = pickStr(q, 'abcxyz019', 1, 12);
      const ext = pickStr(q, 'abcxyz019', 1, 8);
      expect(sanitiseName(`${base}.${ext}`).split('.')[1]).toBe(ext.toUpperCase().slice(0, 3));
    }
  });
  test('batch is collision-free, valid, case-insensitively distinct', () => {
    const batch = inputs.slice(0, 500).concat(inputs.slice(0, 500));
    const out = sanitiseAll(batch);
    expect(new Set(out.map((s) => s.toLowerCase())).size).toBe(out.length);
    for (const o of out) {
      expect(o).toMatch(FAT);
      expect(o.split('.')[0]).not.toMatch(RESERVED);
    }
  });
});

describe('properties (seeded random, long)', () => {
  const r = rng(7);
  const inputs = Array.from({ length: 3000 }, () => randomName(r));
  test('no illegal chars, bounded, no trailing dot/space, not reserved, idempotent', () => {
    for (const i of inputs) {
      const o = sanitiseName(i, long);
      expect(o).not.toMatch(/[<>:"/\\|?*\p{Cc}]/u);
      expect(o.length).toBeGreaterThan(0);
      expect(o.length).toBeLessThanOrEqual(MAX_LONG_NAME);
      expect(o).not.toMatch(/[. ]$/);
      expect(o.split('.')[0]).not.toMatch(RESERVED);
      expect(o).not.toMatch(/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/);
      expect(sanitiseName(o, long)).toBe(o);
    }
  });
});

describe('properties (seeded random batches, long)', () => {
  const lone = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;
  const fold = (o: string): string => o.toUpperCase().toLowerCase();
  test('cap, no lone surrogate, distinct under the target folding', () => {
    const r = rng(99);
    for (let round = 0; round < 40; round++) {
      const batch: string[] = [];
      for (let i = 0; i < 60; i++) {
        const k = r();
        const ext =
          k < 0.3 ? 'x'.repeat(1 + Math.floor(r() * 253)) : k < 0.5 ? '😀'.repeat(1 + Math.floor(r() * 126)) : 'gcode';
        batch.push(k < 0.7 ? `${pickStr(r, 'abσς', 1, 3)}.${ext}` : randomName(r));
      }
      const out = sanitiseAll([...batch, ...batch], long);
      expect(new Set(out.map(fold)).size).toBe(out.length);
      for (const o of out) {
        expect(o.length).toBeLessThanOrEqual(MAX_LONG_NAME);
        expect(o).not.toMatch(lone);
      }
      const u = uniqueName(batch[0]!, out, long);
      expect(out.map(fold)).not.toContain(fold(u));
      expect(u.length).toBeLessThanOrEqual(MAX_LONG_NAME);
    }
  });
  test('random extension kept whole when it fits', () => {
    const r = rng(5);
    for (let i = 0; i < 1000; i++) {
      const ext = pickStr(r, 'abcxyz019', 1, 20);
      expect(sanitiseName(`${pickStr(r, 'abcxyz019', 1, 20)}.${ext}`, long).endsWith(`.${ext}`)).toBe(true);
    }
  });
});

describe('hostile input', () => {
  test('oversize input is cut before work', () => {
    const huge = 'a'.repeat(5_000_000);
    expect(sanitiseName(huge, long).length).toBeLessThanOrEqual(MAX_INPUT_LENGTH);
    expect(sanitiseName(huge)).toBe('AAAAAAAA');
  });
  test('pathological dot/space runs and combining-mark floods stay valid', () => {
    expect(sanitiseName('. '.repeat(100_000))).toBe('FILE');
    expect(sanitiseName(`a${'́'.repeat(100_000)}.gcode`)).toBe('A'); // cut at MAX_INPUT_LENGTH before the extension
    expect(sanitiseName(`a${'́'.repeat(100_000)}.gcode`, long).length).toBeLessThanOrEqual(MAX_LONG_NAME);
    expect(sanitiseName('.'.repeat(100_000) + 'x')).toBe('FILE'); // the x is past the input bound
    expect(sanitiseName('.'.repeat(100) + 'x')).toBe('X');
  });
  test('lone surrogates become underscores, pairs survive in long mode', () => {
    expect(sanitiseName('a\ud800b', long)).toBe('a_b');
    expect(sanitiseName('a\udc00b', long)).toBe('a_b');
    expect(sanitiseName('a😀b', long)).toBe('a😀b');
  });
  test('path separators and traversal cannot survive', () => {
    for (const mode of [{}, long]) {
      expect(sanitiseName('../../etc/passwd', mode)).not.toMatch(/[/\\]/);
      expect(sanitiseName('..\\..\\x', mode)).not.toMatch(/[/\\]/);
      expect(sanitiseName('..', mode)).not.toBe('..');
    }
  });
  test('max identical names all resolve distinct; one more throws', () => {
    const same = Array.from({ length: MAX_ENTRIES }, () => 'model.gcode');
    for (const mode of [{}, long]) {
      const out = sanitiseAll(same, mode);
      expect(new Set(out.map((s) => s.toLowerCase())).size).toBe(MAX_ENTRIES);
    }
    expect(() => sanitiseAll([...same, 'x'])).toThrow(RangeError);
    expect(() =>
      uniqueName(
        'x',
        Array.from({ length: MAX_ENTRIES + 1 }, () => 'y'),
      ),
    ).toThrow(RangeError);
  });
  /** Runs `sanitiseAll`, returning its output and the number of `Set.has` calls (read before the spy is restored). */
  function counted(names: string[], options = {}): { out: string[]; calls: number } {
    const has = vi.spyOn(Set.prototype, 'has');
    try {
      const out = sanitiseAll(names, options);
      return { out, calls: has.mock.calls.length };
    } finally {
      has.mockRestore();
    }
  }
  const distinct = (out: string[]): number => new Set(out.map((s) => s.toUpperCase().toLowerCase())).size;
  test('4096 plate names folding to shared 8.3 candidates resolve uniquely in linear probes', () => {
    const names = Array.from({ length: MAX_ENTRIES }, (_, i) => `plate_${String(i).padStart(4, '0')}.gcode`);
    const { out, calls } = counted(names);
    expect(distinct(out)).toBe(MAX_ENTRIES);
    expect(calls).toBeGreaterThan(0);
    expect(calls).toBeLessThanOrEqual(4 * MAX_ENTRIES);
  });
  test('distinct 8-char stems given twice resolve uniquely in linear probes', () => {
    const stems: string[] = [];
    for (let a = 0; a < 41; a++)
      for (let b = 0; b < 41; b++) stems.push(`ABCDEF${String.fromCharCode(65 + a)}${String.fromCharCode(65 + b)}`);
    expect(stems).toHaveLength(1681);
    const { out, calls } = counted([...stems, ...stems]);
    expect(distinct(out)).toBe(3362);
    expect(calls).toBeLessThanOrEqual(4 * 3362);
  });
  test('distinct long stems given twice resolve uniquely in linear probes', () => {
    const stems = Array.from({ length: 2048 }, (_, i) => `${'x'.repeat(250)}${String(i).padStart(4, '0')}`);
    const { out, calls } = counted([...stems, ...stems], { longFilenames: true });
    expect(distinct(out)).toBe(4096);
    expect(calls).toBeLessThanOrEqual(4 * 4096);
  });
});
