// SPDX-License-Identifier: AGPL-3.0-or-later
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { afterAll, describe, expect, test } from 'vitest';
import { readCuraResourceFolder } from '../src/adapters/definitions/folder.ts';
import { CURA_PINNED_COMMIT, fetchCuraResources, readCuraTar } from '../src/adapters/download/fetch.ts';

const enc = new TextEncoder();
const R = 'Cura-x/resources/';

interface E {
  name: string;
  body?: string;
  type?: string;
  pax?: string;
}
function header(name: string, size: number, type: string): Uint8Array {
  const h = new Uint8Array(512);
  h.set(enc.encode(name).subarray(0, 100), 0);
  h.set(enc.encode(size.toString(8).padStart(11, '0')), 124);
  h[156] = type.charCodeAt(0);
  return h;
}
function block(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(Math.ceil(data.length / 512) * 512);
  out.set(data);
  return out;
}
function tar(entries: E[]): Uint8Array {
  const parts: Uint8Array[] = [];
  for (const e of entries) {
    const body = enc.encode(e.body ?? '');
    if (e.pax !== undefined) {
      const rec = ` path=${e.pax}\n`;
      let len = rec.length + 1;
      if (String(len).length + rec.length !== len) len = String(len).length + rec.length;
      const data = enc.encode(`${len}${rec}`);
      parts.push(header('pax', data.length, 'x'), block(data));
    }
    parts.push(header(e.name, body.length, e.type ?? '0'), block(body));
  }
  parts.push(new Uint8Array(1024));
  return Buffer.concat(parts);
}
const respond =
  (bytes: Uint8Array, status = 200) =>
  async () =>
    new Response(bytes, { status });
const gz = (entries: E[]) => gzipSync(tar(entries));
const GOOD: E[] = [
  { name: `${R}definitions/a.def.json`, body: '{"version":2,"name":"A"}' },
  { name: `${R}variants/sub/b.inst.cfg`, body: '[general]\nversion = 4\n' },
  { name: `${R}quality/q.inst.cfg`, body: 'q' },
  { name: `${R}extruders/e.def.json`, body: '{}' },
  { name: `${R}meshes/skip.stl`, body: 'x' },
  { name: `${R}definitions/.hidden.def.json`, body: 'x' },
  { name: `${R}definitions/link.def.json`, type: '2' },
  { name: `${R}definitions/`, type: '5' },
];

const scratch: string[] = [];
const dir = async () => {
  const d = await mkdtemp(join(tmpdir(), 'fetch-cura-'));
  scratch.push(d);
  return d;
};
afterAll(async () => {
  for (const d of scratch) await rm(d, { recursive: true, force: true });
});
const names = (d: string) => readdir(d);

describe('readCuraTar', () => {
  test('keeps regular files of the four folders only; skips links, directories, dot names, other folders', () => {
    expect([...readCuraTar(tar(GOOD)).keys()].sort()).toEqual([
      'definitions/a.def.json',
      'extruders/e.def.json',
      'quality/q.inst.cfg',
      'variants/sub/b.inst.cfg',
    ]);
  });

  test('a pax path names a long entry; __proto__ is a plain name', () => {
    const long = `${R}definitions/${'x'.repeat(120)}.def.json`;
    const files = readCuraTar(
      tar([
        { name: 'trunc', pax: long, body: 'L' },
        { name: `${R}definitions/__proto__`, body: 'P' },
      ]),
    );
    expect([...files.keys()]).toEqual([`definitions/${'x'.repeat(120)}.def.json`, 'definitions/__proto__']);
  });

  test('names that alias after case folding or NFC are refused', () => {
    expect(() => readCuraTar(tar([{ name: `${R}definitions/A.json` }, { name: `${R}definitions/a.json` }]))).toThrow(
      /case folding/,
    );
    expect(() => readCuraTar(tar([{ name: `${R}definitions/é` }, { name: `${R}definitions/é` }]))).toThrow(
      /case folding/,
    );
  });

  test.each(['definitions/a:b', 'definitions/a\\b', 'definitions/a.', 'definitions/x//y', 'definitions/a\u0001b'])(
    'unsafe name %s is refused',
    (p) => {
      expect(() => readCuraTar(tar([{ name: R + p }]))).toThrow(/unsafe/);
    },
  );

  test('dot segments are skipped, never written', () => {
    expect(readCuraTar(tar([{ name: `${R}definitions/../x` }, { name: `${R}definitions/./y` }])).size).toBe(0);
  });

  test('a truncated tar and a bad size field are refused', () => {
    expect(() => readCuraTar(tar(GOOD).subarray(0, 700))).toThrow(/truncated/);
    const bad = tar([{ name: `${R}definitions/a` }]);
    bad.set(enc.encode('zzzzzzzzzzz'), 124);
    expect(() => readCuraTar(bad)).toThrow(/bad size/);
  });

  test('a corrupt pax record, a pax header over 64 KiB and a ustar prefix', () => {
    expect(() =>
      readCuraTar(tar([{ name: 'pax', type: 'x', body: 'garbage\n' }, { name: `${R}definitions/a` }])),
    ).toThrow(/corrupt pax/);
    const rec = (n: number) => 'x'.repeat(n);
    expect(() => readCuraTar(tar([{ name: 'pax', type: 'x', body: rec(65537) }]))).toThrow(/64 KiB/);
    // 65536 is accepted by the size check (it then fails as a corrupt record, not as too big)
    expect(() => readCuraTar(tar([{ name: 'pax', type: 'x', body: rec(65536) }]))).toThrow(/corrupt pax/);
    const t = tar([{ name: 'a' }]);
    t.set(enc.encode('Cura-x/resources/definitions'), 345);
    expect([...readCuraTar(t).keys()]).toEqual(['definitions/a']);
  });

  describe('caps: the cap is accepted, cap plus one refused', () => {
    const f = (n: number): E[] => Array.from({ length: n }, (_, i) => ({ name: `${R}definitions/f${i}` }));
    test('maxFiles', () => {
      expect(readCuraTar(tar(f(3)), { maxFiles: 3 }).size).toBe(3);
      expect(() => readCuraTar(tar(f(4)), { maxFiles: 3 })).toThrow(/files/);
    });
    test('maxEntries counts every entry', () => {
      const entries = [...f(2), { name: `${R}meshes/x` }];
      expect(readCuraTar(tar(entries), { maxEntries: 3 }).size).toBe(2);
      expect(() => readCuraTar(tar(entries), { maxEntries: 2 })).toThrow(/entries/);
    });
    test('maxFileBytes', () => {
      const e = [{ name: `${R}definitions/a`, body: 'abcd' }];
      expect(readCuraTar(tar(e), { maxFileBytes: 4 }).size).toBe(1);
      expect(() => readCuraTar(tar(e), { maxFileBytes: 3 })).toThrow(/over 3 bytes/);
    });
    test('maxTotalBytes over all files', () => {
      const e = [
        { name: `${R}definitions/a`, body: 'abc' },
        { name: `${R}definitions/b`, body: 'de' },
      ];
      expect(readCuraTar(tar(e), { maxTotalBytes: 5 }).size).toBe(2);
      expect(() => readCuraTar(tar(e), { maxTotalBytes: 4 })).toThrow(/bytes of files/);
    });
    test('maxDepth', () => {
      const e = [{ name: `${R}definitions/a/b/c` }];
      expect(readCuraTar(tar(e), { maxDepth: 2 }).size).toBe(1);
      expect(() => readCuraTar(tar(e), { maxDepth: 1 })).toThrow(/deeper/);
    });
    test('maxPathLength', () => {
      const e = [{ name: `${R}definitions/abcd` }];
      expect(readCuraTar(tar(e), { maxPathLength: 4 }).size).toBe(1);
      expect(() => readCuraTar(tar(e), { maxPathLength: 3 })).toThrow(/longer/);
    });
    test('limits must be positive integers', () => {
      expect(() => readCuraTar(tar([]), { maxFiles: 0 })).toThrow(/positive integer/);
      expect(() => readCuraTar(tar([]), { maxFiles: NaN })).toThrow(/positive integer/);
    });
  });
});

describe('fetchCuraResources', () => {
  test('places the files with source.json and the folder reads back', async () => {
    const dest = join(await dir(), 'cura');
    const r = await fetchCuraResources(dest, { fetch: respond(gz(GOOD)) });
    expect(r).toEqual({
      ok: true,
      source: {
        format: 'cura',
        origin: 'https://github.com/Ultimaker/Cura',
        commit: '5bea2f86153faed3a1c2d9081b8d6b753684678a',
      },
      files: 4,
    });
    expect(JSON.parse(await readFile(join(dest, 'source.json'), 'utf8')).commit).toBe(CURA_PINNED_COMMIT);
    expect(await readFile(join(dest, 'variants/sub/b.inst.cfg'), 'utf8')).toBe('[general]\nversion = 4\n');
    const read = await readCuraResourceFolder(dest);
    expect(read.files.map((x) => x.path).sort()).toEqual([
      'definitions/a.def.json',
      'extruders/e.def.json',
      'variants/sub/b.inst.cfg',
    ]);
  });

  test('requests the tarball of the given commit', async () => {
    const urls: string[] = [];
    const commit = 'a'.repeat(40);
    await fetchCuraResources(join(await dir(), 'c'), {
      commit,
      fetch: async (u) => (urls.push(u), new Response(gz(GOOD))),
    });
    expect(urls).toEqual([`https://codeload.github.com/Ultimaker/Cura/tar.gz/${commit}`]);
  });

  const leftNothing = async (parent: string) => expect(await names(parent)).toEqual([]);

  test('a network failure is retryable and leaves nothing', async () => {
    const p = await dir();
    const r = await fetchCuraResources(join(p, 'cura'), {
      fetch: async () => {
        throw new Error('ECONNRESET');
      },
    });
    expect(r).toMatchObject({ ok: false, retryable: true });
    await leftNothing(p);
  });

  test('a body that fails half way is retryable and leaves nothing', async () => {
    const p = await dir();
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(gz(GOOD).subarray(0, 20));
        c.error(new Error('socket hang up'));
      },
    });
    const r = await fetchCuraResources(join(p, 'cura'), { fetch: async () => new Response(body) });
    expect(r).toMatchObject({ ok: false, retryable: true });
    await leftNothing(p);
  });

  test.each([
    [503, true],
    [429, true],
    [404, false],
  ])('HTTP %i retryable: %s', async (status, retryable) => {
    const p = await dir();
    const r = await fetchCuraResources(join(p, 'cura'), { fetch: respond(new Uint8Array(), status) });
    expect(r).toMatchObject({ ok: false, retryable });
    await leftNothing(p);
  });

  test('a bad archive after good files is not retryable and leaves no partial folder', async () => {
    const p = await dir();
    const bad = gz([...GOOD, { name: `${R}definitions/a:b` }]);
    const r = await fetchCuraResources(join(p, 'cura'), { fetch: respond(bad) });
    expect(r).toMatchObject({ ok: false, retryable: false });
    await leftNothing(p);
  });

  test('a failure while placing files removes the partial folder', async () => {
    const p = await dir();
    // A name that is a file in one entry and a folder in the next: mkdir fails after the first file is written.
    const r = await fetchCuraResources(join(p, 'cura'), {
      fetch: respond(
        gz([
          { name: `${R}definitions/a`, body: '1' },
          { name: `${R}definitions/a/b`, body: '2' },
        ]),
      ),
    });
    expect(r).toMatchObject({ ok: false });
    await leftNothing(p);
  });

  test('download and inflate caps: the cap is accepted, cap plus one refused', async () => {
    const bytes = gz(GOOD);
    const inflated = tar(GOOD).length;
    const ok = async (limits: object) =>
      (await fetchCuraResources(join(await dir(), 'c'), { fetch: respond(bytes), limits })).ok;
    expect(await ok({ maxDownloadBytes: bytes.length })).toBe(true);
    expect(await ok({ maxDownloadBytes: bytes.length - 1 })).toBe(false);
    expect(await ok({ maxTarBytes: inflated })).toBe(true);
    expect(await ok({ maxTarBytes: inflated - 1 })).toBe(false);
  });

  test('a body over the cap without a content-length is cancelled', async () => {
    const p = await dir();
    const bytes = gz(GOOD);
    const r = await fetchCuraResources(join(p, 'cura'), { fetch: respond(bytes), limits: { maxDownloadBytes: 10 } });
    expect(r).toMatchObject({ ok: false, retryable: false, error: expect.stringContaining('over 10 bytes') });
  });

  test('refuses an existing destination and a bad commit, touching nothing', async () => {
    const p = await dir();
    await mkdir(join(p, 'cura'));
    let calls = 0;
    const fetch = async () => (calls++, new Response(gz(GOOD)));
    expect(await fetchCuraResources(join(p, 'cura'), { fetch })).toMatchObject({
      ok: false,
      error: expect.stringContaining('exists'),
    });
    expect(await fetchCuraResources(join(p, 'n'), { fetch, commit: '5bea2f8' })).toMatchObject({
      ok: false,
      error: expect.stringContaining('40'),
    });
    expect(await fetchCuraResources(join(p, 'n'), { fetch, commit: '../x' })).toMatchObject({ ok: false });
    expect(calls).toBe(0);
    expect(await names(p)).toEqual(['cura']);
  });

  test('an archive with no Cura resources fails', async () => {
    const p = await dir();
    const r = await fetchCuraResources(join(p, 'c'), { fetch: respond(gz([{ name: `${R}meshes/x` }])) });
    expect(r).toMatchObject({ ok: false, retryable: false });
    await leftNothing(p);
  });

  test('a body cut short is not cached: the next run with a good server succeeds', async () => {
    const p = await dir();
    const cacheDir = join(p, 'cache');
    const good = gz(GOOD);
    const bad = await fetchCuraResources(join(p, 'one'), {
      fetch: respond(good.subarray(0, good.length - 10)),
      cacheDir,
    });
    expect(bad).toMatchObject({ ok: false, retryable: false });
    expect(existsSync(join(cacheDir, `${CURA_PINNED_COMMIT}.tar.gz`))).toBe(false);
    expect((await fetchCuraResources(join(p, 'two'), { fetch: respond(good), cacheDir })).ok).toBe(true);
  });

  test('a cached file that does not unpack is dropped and downloaded again', async () => {
    const p = await dir();
    const cacheDir = join(p, 'cache');
    await mkdir(cacheDir);
    await writeFile(join(cacheDir, `${CURA_PINNED_COMMIT}.tar.gz`), 'captive portal html');
    expect((await fetchCuraResources(join(p, 'one'), { fetch: respond(gz(GOOD)), cacheDir })).ok).toBe(true);
    expect(await readFile(join(cacheDir, `${CURA_PINNED_COMMIT}.tar.gz`))).toEqual(Buffer.from(gz(GOOD)));
    // and a bad cached file does not survive a failing network either
    await writeFile(join(cacheDir, `${CURA_PINNED_COMMIT}.tar.gz`), 'captive portal html');
    const down = async () => {
      throw new Error('offline');
    };
    expect(await fetchCuraResources(join(p, 'two'), { fetch: down, cacheDir })).toMatchObject({ retryable: true });
    expect(existsSync(join(cacheDir, `${CURA_PINNED_COMMIT}.tar.gz`))).toBe(false);
  });

  test('a cached file over maxDownloadBytes is ignored and the network is asked', async () => {
    const p = await dir();
    const cacheDir = join(p, 'cache');
    await mkdir(cacheDir);
    const bytes = gz(GOOD);
    await writeFile(join(cacheDir, `${CURA_PINNED_COMMIT}.tar.gz`), bytes);
    let calls = 0;
    const fetch = async () => (calls++, new Response(bytes));
    await fetchCuraResources(join(p, 'one'), { fetch, cacheDir, limits: { maxDownloadBytes: bytes.length - 1 } });
    expect(calls).toBe(1);
  });

  test('a declared content-length over the cap is refused before the body is read', async () => {
    const p = await dir();
    const body = new ReadableStream<Uint8Array>({
      pull() {
        throw new Error('body was read');
      },
    });
    const r = await fetchCuraResources(join(p, 'c'), {
      fetch: async () => new Response(body, { headers: { 'content-length': '11' } }),
      limits: { maxDownloadBytes: 10 },
    });
    expect(r).toMatchObject({ ok: false, retryable: false, error: expect.stringContaining('over 10 bytes') });
  });

  test('a fetch that never settles, and a body that stalls, are retryable timeouts and leave nothing', async () => {
    const p = await dir();
    const never = await fetchCuraResources(join(p, 'a'), {
      fetch: () => new Promise<Response>(() => {}),
      idleTimeoutMs: 20,
    });
    expect(never).toMatchObject({ ok: false, retryable: true, error: expect.stringContaining('stalled') });
    const stalled = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(5));
      },
    });
    const r = await fetchCuraResources(join(p, 'b'), { fetch: async () => new Response(stalled), idleTimeoutMs: 20 });
    expect(r).toMatchObject({ ok: false, retryable: true, error: expect.stringContaining('stalled') });
    await leftNothing(p);
    expect(await fetchCuraResources(join(p, 'c'), { fetch: respond(gz(GOOD)), idleTimeoutMs: 0 })).toMatchObject({
      ok: false,
      retryable: false,
    });
  });

  test('cacheDir: a second run uses the cached tarball without the network', async () => {
    const p = await dir();
    const cacheDir = join(p, 'cache');
    let calls = 0;
    const fetch = async () => (calls++, new Response(gz(GOOD)));
    expect((await fetchCuraResources(join(p, 'one'), { fetch, cacheDir })).ok).toBe(true);
    expect((await fetchCuraResources(join(p, 'two'), { fetch, cacheDir })).ok).toBe(true);
    expect(calls).toBe(1);
    expect(existsSync(join(cacheDir, `${CURA_PINNED_COMMIT}.tar.gz`))).toBe(true);
    expect(await names(cacheDir)).toEqual([`${CURA_PINNED_COMMIT}.tar.gz`]);
  });
});

// Live download from GitHub. Skipped with a reason offline; CI sets CURA_FETCH_CACHE to a folder outside the
// repository so the 50 MB tarball is downloaded once per runner.
const online = await fetch('https://codeload.github.com/Ultimaker/Cura/tar.gz/' + CURA_PINNED_COMMIT, {
  method: 'HEAD',
  signal: AbortSignal.timeout(5000),
}).then(
  (r) => r.ok,
  () => false,
);
const CLONE = join(import.meta.dirname, '../../../../.reference/repos/Cura/resources');
describe.skipIf(!online)('live GitHub download (skipped: codeload.github.com unreachable)', () => {
  test('Cura@5bea2f8 downloads, records its commit and matches the local clone', { timeout: 120_000 }, async () => {
    const dest = join(await dir(), 'cura');
    const r = await fetchCuraResources(dest, { cacheDir: process.env.CURA_FETCH_CACHE });
    expect(r).toMatchObject({ ok: true, source: { commit: '5bea2f86153faed3a1c2d9081b8d6b753684678a' } });
    const read = await readCuraResourceFolder(dest, {}, ['definitions', 'extruders', 'variants', 'quality']);
    expect(read.diagnostics).toEqual([]);
    expect(read.files.map((f) => f.path)).toContain('definitions/fdmprinter.def.json');
    if (existsSync(CLONE)) {
      const mine = await readFile(join(dest, 'definitions/fdmprinter.def.json'));
      expect(Buffer.compare(mine, await readFile(join(CLONE, 'definitions/fdmprinter.def.json')))).toBe(0);
    }
  });
});
