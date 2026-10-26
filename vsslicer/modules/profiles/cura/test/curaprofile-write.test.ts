// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { readCuraProfileArchive, writeCuraProfileArchive } from '../src/adapters/archive/curaprofile-archive.ts';
import { readCuraProfile } from '../src/adapters/bundles/cura/read.ts';
import { writeCuraProfile } from '../src/adapters/bundles/cura/write.ts';

const fixture = new Uint8Array(
  readFileSync(new URL('./fixtures/curaprofile/jeremy_petg_06_super_fast.curaprofile', import.meta.url)),
);
const cfg = (extra = '', meta = '') =>
  `[general]\nversion = 4\nname = N\ndefinition = fdmprinter\n\n[metadata]\ntype = quality_changes\nquality_type = draft\n${meta}setting_version = 27\n\n[values]\nlayer_height = 0.3\n${extra}\n`;

describe('writeCuraProfile', () => {
  test('an unmodified real file re-exports byte for byte', () => {
    const r = readCuraProfile(fixture, { settingVersion: 20 });
    const out = writeCuraProfile(r);
    expect(out.diagnostics).toEqual([]);
    expect(Buffer.from(out.bytes).equals(Buffer.from(fixture))).toBe(true);
  });
  test('import(export(x)) equals x', () => {
    const r = readCuraProfile(writeCuraProfileArchive([{ id: 'a b', text: cfg('infill_sparse_density = 20\n') }]));
    const again = readCuraProfile(writeCuraProfile(r).bytes);
    expect(again.entities).toEqual(r.entities);
    expect(again.native).toEqual(r.native);
  });
  test('credentials are not written', () => {
    const r = readCuraProfile(
      writeCuraProfileArchive([{ id: 'a', text: cfg('octoprint_api_key = SECRET1\nspeed_wall = 5\n') }]),
    );
    const out = writeCuraProfile(r);
    const text = new TextDecoder().decode(out.bytes);
    expect(text).not.toContain('SECRET1');
    expect(text).toContain('speed_wall');
    expect(out.diagnostics.map((d) => d.message)).toEqual(['octoprint_api_key looks like a credential; not written']);
  });
  test('the global entry comes first and ids __proto__ and constructor keep their entry name', () => {
    const r = readCuraProfile(
      writeCuraProfileArchive([
        { id: 'constructor', text: cfg('', 'position = 0\n') },
        { id: '__proto__', text: cfg() },
      ]),
    );
    const out = writeCuraProfile(r);
    expect(readCuraProfileArchive(out.bytes).map((e) => e.id)).toEqual(['__proto__', 'constructor']);
  });
  test('machine settings are skipped with a warning', () => {
    const out = writeCuraProfile({
      entities: [{ id: 'm', model: 'x', toolheads: [], settings: {} } as never],
      native: { m: { definition: 'fdmprinter' } },
    });
    expect(readCuraProfileArchive(out.bytes)).toEqual([]);
    expect(out.diagnostics).toHaveLength(1);
  });
  test('an archive over its limit gives an error diagnostic and no bytes', () => {
    const r = readCuraProfile(writeCuraProfileArchive([{ id: 'a', text: cfg() }]));
    const out = writeCuraProfile(r, { archiveLimits: { maxEntries: 0 } });
    expect(out.bytes).toHaveLength(0);
    expect(out.diagnostics[0]?.severity).toBe('error');
  });
  test('a credential key in the metadata is not written and is warned', () => {
    const r = readCuraProfile(writeCuraProfileArchive([{ id: 'a', text: cfg('', 'octoprint_api_key = SECRETM\n') }]));
    const out = writeCuraProfile(r);
    expect(new TextDecoder().decode(out.bytes)).not.toContain('SECRETM');
    expect(out.diagnostics.map((d) => d.message)).toEqual(['octoprint_api_key looks like a credential; not written']);
  });
  test('the entity cap is exactly 10000', () => {
    const {
      entities: [good],
      native,
    } = readCuraProfile(writeCuraProfileArchive([{ id: 'a', text: cfg() }]));
    const junk = (n: number) => Array.from({ length: n }, () => ({}));
    const at = writeCuraProfile({ entities: [...junk(9_999), good] as never, native });
    expect(readCuraProfileArchive(at.bytes).map((e) => e.id)).toEqual(['a']);
    expect(at.diagnostics.some((d) => d.severity === 'error')).toBe(false);
    const over = writeCuraProfile({ entities: [...junk(10_000), good] as never, native });
    expect(readCuraProfileArchive(over.bytes)).toEqual([]);
    expect(over.diagnostics[0]?.message).toContain('more than 10000 entities');
  });
  test('diagnostics are capped at exactly 1000', () => {
    const junk = (n: number) => Array.from({ length: n }, () => ({}));
    const d = (n: number) => writeCuraProfile({ entities: junk(n) as never, native: {} }).diagnostics.length;
    expect([d(999), d(1000), d(1001)]).toEqual([999, 1000, 1000]);
    const r = readCuraProfile(writeCuraProfileArchive([{ id: 'a', text: cfg() }]));
    const settings = Object.fromEntries(Array.from({ length: 1500 }, (_, i) => [`k${i}`, undefined]));
    const one = { ...r.entities[0], settings } as never;
    expect(writeCuraProfile({ entities: [one], native: r.native }).diagnostics).toHaveLength(1000);
    expect(writeCuraProfile({ entities: [{}, one] as never, native: r.native }).diagnostics).toHaveLength(1000);
  });
});
