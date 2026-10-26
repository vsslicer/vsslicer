// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  MAX_DIAGNOSTICS,
  MAX_ENTRIES,
  MAX_INI_BYTES,
  MAX_KEYS_PER_SECTION,
  MAX_LINE_LENGTH,
  MAX_SECTIONS,
  parseIni,
} from '../../src/adapters/ini/parse.ts';

const fx = (n: string) => readFileSync(join(import.meta.dirname, '../fixtures/ini', n), 'utf8');

describe('bundle fixture', () => {
  const doc = parseIni(fx('bundle.ini'), 'bundle.ini');
  const sec = (kind: string, name: string) => doc.sections.find((s) => s.kind === kind && s.name === name)!;

  test('sections, kinds, abstract flag, header lines', () => {
    expect(doc.sections.map((s) => [s.kind, s.name, s.abstract, s.line])).toEqual([
      ['vendor', '', false, 2],
      ['printer_model', 'MK4', false, 6],
      ['print', '*common*', true, 11],
      ['print', '0.20mm DRAFT @MK4', false, 16],
      ['printer', '*common*', true, 22],
      ['printer', 'Original Prusa MK4 0.4 nozzle', false, 25],
      ['filament', 'Generic PLA', false, 30],
    ]);
  });

  test('values verbatim, key order and lines kept, split at first =', () => {
    expect(sec('print', '*common*').entries.map((e) => [e.key, e.value])).toEqual([
      ['perimeters', '2'],
      ['layer_height', '0.20'],
      ['first_layer_height', '0.2'],
    ]);
    const p = sec('print', '0.20mm DRAFT @MK4');
    expect(p.entries.find((e) => e.key === 'compatible_printers_condition')).toEqual({
      key: 'compatible_printers_condition',
      value: 'printer_notes=~/.*MK4.*/ and nozzle_diameter[0]==0.4',
      line: 19,
    });
    expect(p.entries.find((e) => e.key === 'renamed_from')!.value).toBe('"0.20mm OLD"');
    expect(sec('printer', 'Original Prusa MK4 0.4 nozzle').entries[0]).toMatchObject({
      key: 'inherits',
      value: '*common*; *mk4*',
    });
  });

  test('malformed line: diagnostic with file and line, parsing continues', () => {
    expect(doc.diagnostics).toEqual([
      {
        severity: 'error',
        code: 'malformed-line',
        file: 'bundle.ini',
        line: 28,
        message: 'line is neither a comment, a [section] nor key = value',
      },
    ]);
    expect(sec('filament', 'Generic PLA').entries).toHaveLength(3);
  });
});

test('user preset: BOM, CRLF, header-less keys go to a root section', () => {
  const doc = parseIni(fx('user-preset.ini'), 'u.ini');
  expect(doc.diagnostics).toEqual([]);
  expect(doc.sections).toHaveLength(1);
  expect(doc.sections[0]).toMatchObject({ kind: 'root', name: '', abstract: false });
  expect(doc.sections[0]!.entries.map((e) => [e.key, e.value, e.line])).toEqual([
    ['layer_height', '0.15', 2],
    ['perimeters', '3', 3],
    ['start_gcode', 'M104 S[temperature] ; keep = this', 4],
  ]);
});

test('Uint8Array input; keys after an unclosed header are dropped until the next valid header', () => {
  const doc = parseIni(new TextEncoder().encode('[presets]\nprint = x\n[print:a\nk=v\n[print:b]\nz=1\n'), 'b.ini');
  expect(doc.sections.map((s) => [s.kind, s.name])).toEqual([
    ['other', 'presets'],
    ['print', 'b'],
  ]);
  expect(doc.sections[0]!.entries.map((e) => e.key)).toEqual(['print']);
  expect(doc.sections[1]!.entries.map((e) => e.key)).toEqual(['z']);
  expect(doc.diagnostics.map((d) => d.line)).toEqual([3]);
});

test('header name ends at the first ], the rest of the line is ignored (boost)', () => {
  const doc = parseIni('[print:a] ; note\nk=1\n[print:b]]x]\n', 'h.ini');
  expect(doc.sections.map((s) => s.name)).toEqual(['a', 'b']);
  expect(doc.diagnostics).toEqual([]);
});

test('duplicate sections and keys: one warning each, both kept', () => {
  const doc = parseIni('[print:a]\nk=1\nk=2\n[print:a]\nk=3\n', 'd.ini');
  expect(doc.sections).toHaveLength(2);
  expect(doc.sections[0]!.entries).toHaveLength(2);
  expect(doc.diagnostics.map((d) => [d.severity, d.line])).toEqual([
    ['warning', 3],
    ['warning', 4],
  ]);
  expect(doc.diagnostics[0]!.message).toMatch(/boost/);
});

test('header trimming is ASCII space/tab only (boost): an NBSP-padded header is not a print preset', () => {
  const doc = parseIni('[ print:a ]\nk=1\n[\u00a0print:b]\nk=1\n', 'n.ini');
  expect(doc.sections.map((s) => s.kind)).toEqual(['print', 'other']);
  expect(doc.sections[0]!.name).toBe('a');
  expect(doc.sections[1]!.name).toBe('\u00a0print:b');
});

test('an empty earlier duplicate section is not warned about (boost drops it first)', () => {
  const doc = parseIni('[a]\n[a]\nk=1\n', 'e.ini');
  expect(doc.sections).toHaveLength(2);
  expect(doc.diagnostics).toEqual([]);
});

test('invalid UTF-8 in bytes is refused with an error diagnostic', () => {
  const doc = parseIni(new Uint8Array([0x6b, 0x3d, 0xff, 0xc3]), 'u.ini');
  expect(doc.sections).toEqual([]);
  expect(doc.diagnostics.map((d) => d.severity)).toEqual(['error']);
});

describe('hostile input', () => {
  test('oversize input is refused whole', () => {
    const doc = parseIni(new Uint8Array(MAX_INI_BYTES + 1), 'big.ini');
    expect(doc.sections).toEqual([]);
    expect(doc.diagnostics).toHaveLength(1);
    expect(doc.diagnostics[0]!.line).toBeUndefined();
  });

  test('a 1 MB line is skipped, the next line still read', () => {
    const doc = parseIni(`[print:a]\nk = ${'x'.repeat(1_000_000)}\nok = 1\n`, 'l.ini');
    expect(doc.diagnostics.map((d) => d.line)).toEqual([2]);
    expect(doc.sections[0]!.entries.map((e) => e.key)).toEqual(['ok']);
    expect(MAX_LINE_LENGTH).toBeLessThan(1_000_000);
  });

  test('100 000 sections stop at the cap with one diagnostic', () => {
    const doc = parseIni(Array.from({ length: 100_000 }, (_, i) => `[filament:f${i}]`).join('\n'), 's.ini');
    expect(doc.sections).toHaveLength(MAX_SECTIONS);
    expect(doc.diagnostics).toHaveLength(1);
    expect(doc.diagnostics[0]!.line).toBe(MAX_SECTIONS + 1);
  });

  test('60 sections x 9 999 keys stop at the total entry cap with the cap diagnostic last', () => {
    const body = 'a=1\n'.repeat(MAX_KEYS_PER_SECTION - 1);
    const doc = parseIni(Array.from({ length: 60 }, (_, i) => `[print:s${i}]\n${body}`).join(''), 'e.ini');
    const entries = doc.sections.reduce((n, s) => n + s.entries.length, 0);
    expect(entries).toBe(MAX_ENTRIES);
    expect(doc.diagnostics.length).toBeLessThanOrEqual(MAX_DIAGNOSTICS + 2);
    expect(doc.diagnostics.filter((d) => d.message.includes('entries')).length).toBe(1);
    expect(doc.diagnostics.at(-1)!.message).toContain(String(MAX_ENTRIES));
  });

  test('too many keys in one section: extras dropped, one diagnostic, next section unaffected', () => {
    const body = Array.from({ length: MAX_KEYS_PER_SECTION + 5 }, (_, i) => `k${i} = ${i}`).join('\n');
    const doc = parseIni(`[print:a]\n${body}\n[print:b]\nz = 1\n`, 'k.ini');
    expect(doc.sections[0]!.entries).toHaveLength(MAX_KEYS_PER_SECTION);
    expect(doc.sections[1]!.entries).toHaveLength(1);
    expect(doc.diagnostics).toHaveLength(1);
  });

  test('an =-less flood is linear: diagnostics capped', () => {
    const doc = parseIni('garbage\n'.repeat(300_000), 'f.ini');
    expect(doc.sections).toEqual([]);
    expect(doc.diagnostics).toHaveLength(MAX_DIAGNOSTICS + 1);
    expect(doc.diagnostics.at(-1)!.message).toBe('further diagnostics suppressed');
  });

  test('CRLF-only and BOM-only inputs are empty', () => {
    expect(parseIni('﻿\r\n\r\n', 'e.ini')).toEqual({ sections: [], diagnostics: [] });
    expect(parseIni('', 'e.ini')).toEqual({ sections: [], diagnostics: [] });
  });
});

const pinned = join(
  import.meta.dirname,
  '../../../../../.reference/repos/PrusaSlicer-2.9/resources/profiles/PrusaResearch.ini',
);
describe.skipIf(!existsSync(pinned))('PrusaResearch.ini@b028299', () => {
  test('golden counts before flattening', () => {
    const doc = parseIni(readFileSync(pinned), 'PrusaResearch.ini');
    const n = (k: string) => doc.sections.filter((s) => s.kind === k).length;
    expect(doc.diagnostics).toEqual([]);
    expect([n('vendor'), n('printer_model'), n('printer'), n('print'), n('filament'), n('other')]).toEqual([
      1, 35, 238, 633, 6069, 0,
    ]);
    expect(doc.sections.some((s) => s.kind === 'print' && s.abstract)).toBe(true);
  });
});
