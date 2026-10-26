// SPDX-License-Identifier: AGPL-3.0-or-later
import { zipSync, type Zippable } from 'fflate';
import { describe, expect, test } from 'vitest';
import {
  MAX_BUNDLE_ENTRIES,
  MAX_BUNDLE_ENTRY_BYTES,
  MAX_BUNDLE_TOTAL_BYTES,
  MAX_ENTRY_NAME_LENGTH,
  readBundleArchive,
  writeBundleArchive,
} from '../src/adapters/archive/bundle-archive.ts';

const enc = (s: string) => new TextEncoder().encode(s);
const dec = (b: Uint8Array) => new TextDecoder().decode(b);
const preset = (name: string) => enc(JSON.stringify({ name, inherits: 'base', layer_height: '0.2' }));
const stored = (files: Zippable) => zipSync(files, { level: 0 });

/** Central-directory record offsets of an archive, for patching hostile fields into a valid zip. */
function centralRecords(zip: Uint8Array): number[] {
  const v = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const out: number[] = [];
  for (let i = 0; i + 4 <= zip.length; i++) if (v.getUint32(i, true) === 0x02014b50) out.push(i);
  return out;
}
const patch32 = (zip: Uint8Array, at: number, value: number) =>
  new DataView(zip.buffer, zip.byteOffset).setUint32(at, value, true);

describe('readBundleArchive', () => {
  test('reads a bundle written by the writer, entries in memory, manifest parsed', () => {
    const zip = writeBundleArchive({
      name: 'My Bundle',
      clock: '20261026120000',
      printer: [{ fileName: 'P1.json', data: preset('P1') }],
      filament: [{ fileName: 'PLA.json', data: preset('PLA') }],
      process: [{ fileName: '0.20mm.json', data: preset('0.20mm') }],
    });
    const r = readBundleArchive(zip);
    expect([...r.entries.keys()]).toEqual(['printer/P1.json', 'filament/PLA.json', 'process/0.20mm.json']);
    expect(JSON.parse(dec(r.entries.get('filament/PLA.json')!)).name).toBe('PLA');
    expect(r.manifest).toMatchObject({
      bundleId: 'offline_My-Bundle_20261026120000',
      bundleType: 'printer config bundle',
      printerConfig: ['printer/P1.json'],
      filamentConfig: ['filament/PLA.json'],
      processConfig: ['process/0.20mm.json'],
    });
  });

  test('a bundle without a manifest returns the presets alone; directory entries are skipped', () => {
    const r = readBundleArchive(zipSync({ 'printer/': new Uint8Array(0), 'printer/a.json': preset('a') }));
    expect(r.manifest).toBeUndefined();
    expect([...r.entries.keys()]).toEqual(['printer/a.json']);
  });

  test('a manifest listing a missing entry is refused', () => {
    const manifest = {
      version: '',
      bundle_id: 'x',
      bundle_type: 'printer config bundle',
      printer_config: ['printer/gone.json'],
    };
    expect(() => readBundleArchive(zipSync({ 'bundle_structure.json': enc(JSON.stringify(manifest)) }))).toThrow(
      /bundle_structure\.json/,
    );
  });

  test.each([
    ['../evil.json', /segment/],
    ['printer/../../evil.json', /segment/],
    ['printer/.. /evil.json', /segment/],
    ['/etc/passwd', /absolute/],
    ['C:/evil.json', /drive-letter/],
    ['printer\\..\\evil.json', /backslash/],
    ['printer/a\0.json', /NUL/],
    ['printer//a.json', /segment/],
    ['x'.repeat(MAX_ENTRY_NAME_LENGTH + 1), /longer/],
  ])('refuses the unsafe name %j', (name, why) => {
    expect(() => readBundleArchive(zipSync({ [name]: preset('x') }))).toThrow(why);
  });

  test('refuses a symbolic link entry (Unix mode in the external attributes)', () => {
    const zip = zipSync({ 'printer/a.json': [enc('/etc/passwd'), { os: 3, attrs: (0o120777 << 16) >>> 0 }] });
    expect(() => readBundleArchive(zip)).toThrow(/symbolic link/);
    const regular = zipSync({ 'printer/a.json': [preset('a'), { os: 3, attrs: (0o100644 << 16) >>> 0 }] });
    expect(readBundleArchive(regular).entries.size).toBe(1);
  });

  test('refuses duplicate names, also differing only in case', () => {
    const zip = zipSync({ 'printer/a.json': preset('a'), 'printer/b.json': preset('b') });
    // Rename the second entry to the first in both headers (same length names).
    for (let i = 0; i + 14 <= zip.length; i++) {
      if (dec(zip.subarray(i, i + 14)) === 'printer/b.json') zip.set(enc('printer/a.json'), i);
    }
    expect(() => readBundleArchive(zip)).toThrow(/duplicate/);
    expect(() => readBundleArchive(zipSync({ 'printer/A.json': preset('a'), 'printer/a.json': preset('b') }))).toThrow(
      /duplicate/,
    );
  });

  test('refuses overlapping entries (two records pointing at the same data)', () => {
    const zip = stored({ 'printer/a.json': preset('a'), 'printer/b.json': preset('a') });
    const [first, second] = centralRecords(zip);
    patch32(zip, second! + 42, new DataView(zip.buffer).getUint32(first! + 42, true));
    expect(() => readBundleArchive(zip)).toThrow(/overlap/);
  });

  test(`entry count: ${MAX_BUNDLE_ENTRIES} entries pass, one more and 10 000 are refused`, () => {
    const many = (n: number) => {
      const files: Zippable = {};
      for (let i = 0; i < n; i++) files[`printer/${i}.json`] = enc('{}');
      return stored(files);
    };
    expect(readBundleArchive(many(MAX_BUNDLE_ENTRIES)).entries.size).toBe(MAX_BUNDLE_ENTRIES);
    expect(() => readBundleArchive(many(MAX_BUNDLE_ENTRIES + 1))).toThrow(/over the limit of 1024/);
    expect(() => readBundleArchive(many(10_000))).toThrow(/10000 entries/);
  });

  test('entry size: exactly the limit passes, one byte over is refused', () => {
    const at = new Uint8Array(MAX_BUNDLE_ENTRY_BYTES).fill(0x20);
    expect(readBundleArchive(stored({ 'printer/a.json': at })).entries.get('printer/a.json')!.length).toBe(
      MAX_BUNDLE_ENTRY_BYTES,
    );
    const over = new Uint8Array(MAX_BUNDLE_ENTRY_BYTES + 1);
    expect(() => readBundleArchive(stored({ 'printer/a.json': over }))).toThrow(/declares 8388609 bytes/);
  });

  test('total size: exactly the limit passes, one byte over is refused', () => {
    const big = new Uint8Array(MAX_BUNDLE_ENTRY_BYTES);
    const files: Zippable = {};
    for (let i = 0; i < MAX_BUNDLE_TOTAL_BYTES / MAX_BUNDLE_ENTRY_BYTES; i++) files[`process/${i}.json`] = big;
    expect(readBundleArchive(stored(files)).entries.size).toBe(4);
    files['process/extra.json'] = new Uint8Array(1);
    expect(() => readBundleArchive(stored(files))).toThrow(/in total/);
  });

  test('zip bomb: a highly compressible entry is refused by ratio before inflating', () => {
    const zip = zipSync({ 'printer/a.json': new Uint8Array(1024 * 1024) }, { level: 9 });
    expect(() => readBundleArchive(zip)).toThrow(/compresses more than 100:1/);
  });

  test('zip bomb: an entry that inflates past its declared size is stopped', () => {
    const data = enc(JSON.stringify({ values: Array.from({ length: 2000 }, (_, i) => i) }));
    const zip = zipSync({ 'printer/a.json': data });
    const [record] = centralRecords(zip);
    patch32(zip, record! + 24, 100); // declare 100 bytes; the stream holds far more
    expect(() => readBundleArchive(zip)).toThrow(/inflates past its declared size/);
  });

  test('corrupt and non-zip input is refused with a message', () => {
    expect(() => readBundleArchive(enc('not a zip'))).toThrow(/no end of central directory/);
    expect(() => readBundleArchive(new Uint8Array(0))).toThrow(/no end of central directory/);
    const zip = zipSync({ 'printer/a.json': preset('a') });
    const [record] = centralRecords(zip);
    patch32(zip, record! + 42, zip.length - 10);
    expect(() => readBundleArchive(zip)).toThrow(/corrupt/);
  });
});

describe('writeBundleArchive', () => {
  const input = {
    name: 'B',
    clock: '1',
    printer: [{ fileName: 'P.json', data: preset('P') }],
    filament: [{ fileName: 'F.json', data: preset('F') }],
  };

  test('is deterministic: same input, same bytes', () => {
    expect(writeBundleArchive(input)).toEqual(writeBundleArchive(structuredClone(input)));
  });

  test('writes the manifest with buildBundleStructure, last, as Orca does', () => {
    const r = readBundleArchive(writeBundleArchive(input));
    expect(r.manifest).toMatchObject({ version: '', printerConfig: ['printer/P.json'], processConfig: [] });
  });

  test.each(['../x.json', 'a/b.json', 'a\\b.json', '/x.json', '', '..', 'a\0.json'])(
    'refuses the unsafe file name %j',
    (fileName) => {
      expect(() => writeBundleArchive({ name: 'B', clock: '1', printer: [{ fileName, data: preset('x') }] })).toThrow(
        /unsafe preset file name/,
      );
    },
  );

  test('refuses duplicates and over-limit input', () => {
    const p = { fileName: 'a.json', data: preset('a') };
    expect(() => writeBundleArchive({ name: 'B', clock: '1', printer: [p, { ...p, fileName: 'A.json' }] })).toThrow(
      /duplicate/,
    );
    const many = Array.from({ length: MAX_BUNDLE_ENTRIES }, (_, i) => ({ fileName: `${i}.json`, data: enc('{}') }));
    expect(() => writeBundleArchive({ name: 'B', clock: '1', process: many })).toThrow(/more than 1024 entries/);
    const huge = { fileName: 'h.json', data: new Uint8Array(MAX_BUNDLE_ENTRY_BYTES + 1) };
    expect(() => writeBundleArchive({ name: 'B', clock: '1', process: [huge] })).toThrow(/over 8388608 bytes/);
  });
});
