// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from 'vitest';
import { BUNDLE_LIMITS, buildBundleStructure, parseBundleStructure } from '../src/domain/bundle/index.ts';

// Shape of OrcaSlicer@09aa0114b4e1 ExportPresetBundleDialog.cpp:374-425 and PresetBundle.cpp:2349.
const manifest = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    version: '02.03.00.62',
    bundle_id: '123_mybundle_20260101',
    bundle_type: 'printer config bundle',
    printer_preset_name: 'export',
    printer_config: ['printer/A.json'],
    filament_config: ['filament/F.json'],
    process_config: ['process/P.json'],
    printer_asset: { 'printer/A.json': { bed_model: 'bed/0/model.stl' } },
    ...over,
  });
const files = new Set(['printer/A.json', 'filament/F.json', 'process/P.json', 'bed/0/model.stl']);
const code = (text: string, entries?: Set<string>) => {
  const r = parseBundleStructure(text, entries);
  return r.ok ? 'ok' : r.error.code;
};

test('valid manifests parse, offline (empty version) too', () => {
  const r = parseBundleStructure(manifest(), files);
  expect(r.ok && r.bundle.printerAsset['printer/A.json']).toEqual({ bed_model: 'bed/0/model.stl' });
  expect(code(manifest({ version: '', printer_asset: undefined }), files)).toBe('ok');
});

test('typed diagnostics', () => {
  expect(code(manifest({ bundle_type: 'filament bundle' }))).toBe('unknown-bundle-type');
  expect(code(manifest({ version: 'v2' }))).toBe('unsupported-version');
  expect(code(manifest({ version: 2 }))).toBe('unsupported-version');
  expect(code(manifest(), new Set(['printer/A.json']))).toBe('missing-file');
  expect(code('{')).toBe('invalid-json');
  expect(code('[]')).toBe('invalid-structure');
  expect(code(manifest({ printer_config: 'x' }))).toBe('invalid-structure');
});

test('export writes offline_ ids and never a user id', () => {
  const m = buildBundleStructure({
    name: '42/my bundle',
    clock: '2026',
    printerConfig: [],
    filamentConfig: [],
    processConfig: [],
  });
  expect(m.bundle_id).toBe('offline_42-my-bundle_2026');
  expect(m.version).toBe('');
  expect(parseBundleStructure(JSON.stringify(m)).ok).toBe(true);
});

test('hostile: over 1 MiB, by characters and by multibyte bytes', () => {
  expect(code(manifest({ pad: 'a'.repeat(BUNDLE_LIMITS.maxBytes) }))).toBe('too-large');
  expect(code(manifest({ pad: 'é'.repeat(BUNDLE_LIMITS.maxBytes / 2) }))).toBe('too-large');
});

test('hostile: nesting over 16 is refused, 16 allowed; brackets in strings do not count', () => {
  const nest = (n: number) => '['.repeat(n) + ']'.repeat(n);
  expect(code(`{"a":${nest(15)}}`)).not.toBe('too-deep'); // depth 16
  expect(code(`{"a":${nest(17)}}`)).toBe('too-deep');
  expect(code('['.repeat(100_000))).toBe('too-deep'); // unterminated bomb, rejected before JSON.parse
  expect(code(manifest({ s: '[[[[[[[[[[[[[[[[[[[[\\"[[[' }))).toBe('ok');
});

test('hostile: more than 10,000 listed files', () => {
  const many = (n: number) => Array.from({ length: n }, (_, i) => `f/${i}.json`);
  expect(code(manifest({ printer_config: many(10_001), printer_asset: undefined }))).toBe('too-many-files');
  expect(code(manifest({ printer_config: many(5001), process_config: many(5000), printer_asset: undefined }))).toBe(
    'too-many-files',
  );
  expect(
    code(manifest({ printer_config: many(10_000), filament_config: [], process_config: [], printer_asset: undefined })),
  ).toBe('ok');
});

test.each([
  ['/etc/passwd'],
  ['\\windows\\x.json'],
  ['C:/x.json'],
  ['printer/../../x.json'],
  ['printer\\..\\x.json'],
  ['a\0b.json'],
  ['a'.repeat(513)],
])('hostile: unsafe listed path %j', (p) => {
  expect(code(manifest({ printer_config: [p], printer_asset: undefined }))).toBe('unsafe-path');
  expect(code(manifest({ printer_asset: { 'printer/A.json': { bed_model: p } } }))).toBe('unsafe-path');
});

test('hostile: bundle_id must be one safe path component; 512 chars is the limit', () => {
  expect(code(manifest({ bundle_id: '../x' }))).toBe('unsafe-path');
  expect(code(manifest({ bundle_id: 'a/b' }))).toBe('unsafe-path');
  expect(code(manifest({ printer_config: ['a'.repeat(512)], printer_asset: undefined }))).toBe('ok');
});

test('hostile __proto__ keys stay plain data and do not replace the prototype', () => {
  const text = manifest().replace(
    '"printer_asset":{',
    '"printer_asset":{"__proto__":{"__proto__":"bed/0/model.stl","x":"bed/0/model.stl"},',
  );
  const r = parseBundleStructure(text, files);
  expect(r.ok).toBe(true);
  if (!r.ok) return;
  expect(Object.getPrototypeOf(r.bundle.printerAsset)).toBeNull();
  expect(Object.keys(r.bundle.printerAsset)).toContain('__proto__');
  const inner = Object.getOwnPropertyDescriptor(r.bundle.printerAsset, '__proto__')?.value;
  expect(Object.getPrototypeOf(inner)).toBeNull();
  expect(Object.keys(inner)).toEqual(['__proto__', 'x']);
});

test.each(['', '.', ' ', '..', '.. ', '...', 'a/', 'a//b', 'a/. /b', '. '])('unsafe bundle_id %j is refused', (id) => {
  expect(code(manifest({ bundle_id: id }))).toBe('unsafe-path');
});

test.each(['', '.', ' ', '.. ', '...', 'printer/..', 'printer/. '])('unsafe list entry %j is refused', (f) => {
  expect(code(manifest({ printer_config: [f] }))).toBe('unsafe-path');
  expect(code(manifest({ printer_asset: { 'printer/A.json': { bed_model: f } } }))).toBe('unsafe-path');
});
