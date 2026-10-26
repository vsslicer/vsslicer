// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import {
  ENGINE_MANIFEST_SCHEMA,
  ENGINE_SOURCES,
  MANIFEST_LIMITS,
  parseEngineManifest,
  validateEngineManifest,
} from '../src/domain/index.ts';

const sha = 'a'.repeat(64);
const rel = (over: object = {}) => ({ url: 'https://example.com/e.zip', size: 10, sha256: sha, ...over });
const good = () => ({
  schemaVersion: 1,
  engine: 'orca',
  version: '2.3.0',
  releases: { 'darwin-arm64': rel(), 'linux-x64': rel() },
});

describe('engine manifest', () => {
  test('accepts a good manifest', () => {
    expect(validateEngineManifest(good()).ok).toBe(true);
    expect(ENGINE_MANIFEST_SCHEMA.required).toContain('releases');
  });

  test('sources are the three documented values', () => {
    expect([...ENGINE_SOURCES]).toEqual(['user-setting', 'detected', 'downloaded']);
  });

  test('a missing SHA-256 for any OS fails', () => {
    const m = good();
    delete (m.releases['linux-x64'] as Partial<ReturnType<typeof rel>>).sha256;
    const r = validateEngineManifest(m);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors[0]).toContain('linux-x64.sha256');
  });

  test.each([
    ['short hash', { sha256: 'abc' }],
    ['uppercase hash', { sha256: 'A'.repeat(64) }],
    ['http url', { url: 'http://example.com/e.zip' }],
    ['zero size', { size: 0 }],
    ['float size', { size: 1.5 }],
    ['huge size', { size: MANIFEST_LIMITS.maxReleaseBytes + 1 }],
  ])('rejects %s', (_n, over) => {
    const m = good();
    m.releases['darwin-arm64'] = rel(over);
    expect(validateEngineManifest(m).ok).toBe(false);
  });

  test('rejects non-objects, wrong version, empty releases', () => {
    for (const v of [null, 1, 'x', [], { ...good(), schemaVersion: 2 }, { ...good(), releases: {} }])
      expect(validateEngineManifest(v).ok).toBe(false);
  });

  test('hostile: oversize text, bad JSON, too many platforms, huge strings, deep nesting', () => {
    expect(parseEngineManifest(' '.repeat(MANIFEST_LIMITS.maxChars + 1)).ok).toBe(false);
    expect(parseEngineManifest('{').ok).toBe(false);
    const many = Object.fromEntries(Array.from({ length: 1000 }, (_, i) => [`p${i}`, rel()]));
    const r = validateEngineManifest({ ...good(), releases: many });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors).toHaveLength(1); // no per-entry work past the count bound
    expect(validateEngineManifest({ ...good(), engine: 'x'.repeat(100_000) }).ok).toBe(false);
    const deep = '['.repeat(5000) + ']'.repeat(5000);
    expect(parseEngineManifest(deep).ok).toBe(false);
  });

  test('parse round-trips a good manifest', () => {
    expect(parseEngineManifest(JSON.stringify(good())).ok).toBe(true);
  });
});

describe('schema and validator agree', () => {
  type S = { required?: string[]; additionalProperties?: unknown; properties?: Record<string, unknown> };
  // Minimal check of the schema's required/additionalProperties at the two object levels.
  const schemaOk = (v: Record<string, unknown>, s: S): boolean =>
    (s.required ?? []).every((k) => Object.hasOwn(v, k)) &&
    (s.additionalProperties !== false || Object.keys(v).every((k) => Object.hasOwn(s.properties ?? {}, k)));
  const agree = (m: Record<string, unknown>) => {
    const rs = ENGINE_MANIFEST_SCHEMA.properties.releases.additionalProperties as unknown as S;
    const top = schemaOk(m, ENGINE_MANIFEST_SCHEMA as unknown as S);
    const rels = Object.values((m.releases ?? {}) as Record<string, Record<string, unknown>>).every(
      (r) =>
        schemaOk(r, rs) && new RegExp((rs.properties as { url: { pattern: string } }).url.pattern).test(String(r.url)),
    );
    return top && rels;
  };
  const samples: Record<string, unknown>[] = [
    good(),
    { ...good(), extra: 1 },
    { ...good(), releases: { a: rel({ url: 'https:evil' }) } },
    { ...good(), releases: { a: rel({ url: 'HTTPS://E.COM/x' }) } },
    JSON.parse(
      '{"__proto__":{"x":1},"schemaVersion":1,"engine":"e","version":"1","releases":{"a":{"url":"https://h/x","size":1,"sha256":"' +
        sha +
        '"}}}',
    ),
    { ...good(), releases: { a: rel({ evil: 1 }) } },
    { ...good(), releases: { a: { url: 'https://h/x', size: 1 } } },
  ];
  test.each(samples.map((s, i) => [i, s] as const))('sample %i', (_i, m) => {
    expect(validateEngineManifest(m).ok).toBe(agree(m));
  });
  test('rejects hostile urls', () => {
    for (const url of ['https:// evil com\n', 'https://u:p@host/x', 'https://', 'http://h/x'])
      expect(validateEngineManifest({ ...good(), releases: { a: rel({ url }) } }).ok).toBe(false);
  });
});
