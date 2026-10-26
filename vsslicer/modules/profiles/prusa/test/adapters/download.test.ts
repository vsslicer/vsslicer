// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { createServer, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import { DownloadError, downloadPrusaVendorBundles, DOWNLOAD_LIMITS } from '../../src/index.ts';

const COMMIT = 'a'.repeat(40);
const REPOS = ['repo-one', 'repo-two'] as const;

interface E {
  name: string;
  data?: string;
  type?: string;
}
function header(name: string, size: number, type: string): Buffer {
  const h = Buffer.alloc(512);
  h.write(name, 0);
  h.write('0000644\0', 100);
  h.write(size.toString(8).padStart(11, '0') + '\0', 124);
  h.write('        ', 148);
  h.write(type, 156);
  let sum = 0;
  for (const b of h) sum += b;
  h.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
  return h;
}
const pad = (b: Buffer) => Buffer.concat([b, Buffer.alloc((512 - (b.length % 512)) % 512)]);
function tarOf(entries: E[], comment: string | null = COMMIT): Buffer {
  const parts: Buffer[] = [];
  if (comment !== null) {
    const rec = ` comment=${comment}\n`;
    const len =
      rec.length + String(rec.length).length + (String(rec.length + 1).length > String(rec.length).length ? 1 : 0);
    const body = Buffer.from(`${len}${rec}`);
    parts.push(header('pax_global_header', body.length, 'g'), pad(body));
  }
  for (const e of entries) {
    const data = Buffer.from(e.data ?? '');
    const type = e.type ?? '0';
    parts.push(header(e.name, type === '0' ? data.length : 0, type), type === '0' ? pad(data) : Buffer.alloc(0));
  }
  return Buffer.concat([...parts, Buffer.alloc(1024)]);
}
const good = (repo: string): Buffer =>
  gzipSync(
    tarOf([
      { name: `${repo}-${COMMIT}/`, type: '5' },
      { name: `${repo}-${COMMIT}/PrusaResearch.ini`, data: `[vendor]\nname = ${repo}\n` },
    ]),
  );

type Handler = (url: string, res: ServerResponse) => void;
let handler: Handler;
let server: Server;
let base: string;
let work: string;
let hits: string[];
beforeAll(async () => {
  server = createServer((req, res) => {
    hits.push(req.url!);
    handler(req.url!, res);
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => server.close());
afterEach(async () => {
  if (work) await rm(work, { recursive: true, force: true });
});
async function run(h: Handler, extra: Record<string, unknown> = {}) {
  hits = [];
  handler = h;
  work = await mkdtemp(join(tmpdir(), 'prf40-'));
  return downloadPrusaVendorBundles({ commit: COMMIT, targetDir: work, baseUrl: base, repos: REPOS, ...extra });
}
const serve = (body: Buffer) => (_u: string, res: ServerResponse) => res.end(body);
const serveGood: Handler = (u, res) => res.end(good(u.split('/')[1]!));
const failure = async (p: Promise<unknown>) =>
  (await p.then(
    () => undefined,
    (e: unknown) => e,
  )) as DownloadError;

test('downloads both bundles at the pinned commit and records source', async () => {
  const out = await run(serveGood);
  expect(hits).toEqual(REPOS.map((r) => `/${r}/tar.gz/${COMMIT}`));
  expect(out.map((o) => o.source)).toEqual(
    REPOS.map((r) => ({ format: 'prusa-ini', origin: `${base}/${r}/tar.gz/${COMMIT}`, commit: COMMIT })),
  );
  expect(await readFile(join(work, 'repo-one', 'PrusaResearch.ini'), 'utf8')).toContain('name = repo-one');
  expect((await readdir(work)).sort()).toEqual([...REPOS]); // no staging folder left
});

test('follows redirects up to the limit and no further', async () => {
  const redirecting: Handler = (u, res) => {
    if (u.startsWith('/r/')) return void res.end(good('repo-one'));
    res.statusCode = 302;
    res.setHeader('location', u.startsWith('/repo-one') ? '/r/1' : '/r/1');
    res.end();
  };
  await run(redirecting, { repos: ['repo-one'] });
  const loop: Handler = (_u, res) => {
    res.statusCode = 302;
    res.setHeader('location', '/again');
    res.end();
  };
  const e = await failure(run(loop, { repos: ['repo-one'] }));
  expect(e.message).toMatch(/more than 5 redirects/);
  expect(hits).toHaveLength(6);
});

test('a redirect to another scheme is refused', async () => {
  const e = await failure(
    run((_u, res) => {
      res.statusCode = 302;
      res.setHeader('location', 'https://example.invalid/x');
      res.end();
    }),
  );
  expect(e.message).toMatch(/scheme/);
  expect(e.retryable).toBe(false);
});

test('a connection cut mid-download is retryable and leaves nothing behind', async () => {
  let n = 0;
  const e = await failure(
    run((u, res) => {
      if (n++ === 0) return void res.end(good(u.split('/')[1]!));
      const b = good('repo-two');
      res.writeHead(200, { 'content-length': b.length });
      res.write(b.subarray(0, 20));
      setTimeout(() => res.destroy(), 10);
    }),
  );
  expect(e).toBeInstanceOf(DownloadError);
  expect(e.retryable).toBe(true);
  expect(await readdir(work)).toEqual([]);
});

test('5xx and 429 are retryable, 404 is not', async () => {
  for (const [status, retry] of [
    [503, true],
    [429, true],
    [404, false],
  ] as const) {
    const e = await failure(run((_u, res) => ((res.statusCode = status), res.end()), { repos: ['repo-one'] }));
    expect([status, e.retryable]).toEqual([status, retry]);
  }
});

test('a stalled server hits the deadline as a retryable error', async () => {
  const e = await failure(run(() => undefined, { repos: ['repo-one'], limits: { timeoutMs: 200 } }));
  expect(e.retryable).toBe(true);
  expect(e.message).toMatch(/timed out/);
});

test('the archive size cap applies to Content-Length and to a body that lies', async () => {
  const big = gzipSync(randomBytes(100_000));
  const limits = { maxArchiveBytes: 1000 };
  let e = await failure(run(serve(big), { limits, repos: ['repo-one'] }));
  expect(e.message).toMatch(/declares/);
  e = await failure(
    run((_u, res) => void res.writeHead(200).end(big), { limits, repos: ['repo-one'] }), // chunked: no Content-Length
  );
  expect(e.message).toMatch(/over the 1000 byte cap/);
});

test('a gzip bomb is stopped at maxTarBytes', async () => {
  const e = await failure(
    run(serve(gzipSync(Buffer.alloc(5_000_000))), { limits: { maxTarBytes: 100_000 }, repos: ['repo-one'] }),
  );
  expect(e.message).toMatch(/not a gzip archive within 100000/);
});

test.each([
  ['dot-dot', [{ name: `x/../../evil` }]],
  ['absolute', [{ name: `/etc/evil` }]],
  ['backslash', [{ name: `x/a\\b` }]],
  ['symlink', [{ name: `x/link`, type: '2' }]],
  ['hard link', [{ name: `x/link`, type: '1' }]],
  [
    'case alias',
    [
      { name: 'x/A.ini', data: 'a' },
      { name: 'x/a.ini', data: 'b' },
    ],
  ],
  [
    'unicode alias',
    [
      { name: 'x/é', data: 'a' },
      { name: 'x/é', data: 'b' },
    ],
  ],
  [
    'file then folder',
    [
      { name: 'x/a', data: 'a' },
      { name: 'x/a/b', data: 'b' },
    ],
  ],
  [
    'duplicate',
    [
      { name: 'x/a', data: 'a' },
      { name: 'x/a', data: 'b' },
    ],
  ],
  ['too deep', [{ name: 'x/' + Array(20).fill('d').join('/') }]],
] as [string, E[]][])('unsafe archive: %s is refused and nothing is written', async (_n, entries) => {
  const e = await failure(run(serve(gzipSync(tarOf(entries))), { repos: ['repo-one'] }));
  expect(e).toBeInstanceOf(DownloadError);
  expect(e.retryable).toBe(false);
  expect(await readdir(work)).toEqual([]);
});

test('caps count entries and bytes across every archive of one call', async () => {
  const two = (r: string) =>
    gzipSync(
      tarOf([
        { name: `${r}/a`, data: 'x'.repeat(600) },
        { name: `${r}/b`, data: 'y' },
      ]),
    );
  let e = await failure(run((u, res) => res.end(two(u.split('/')[1]!)), { limits: { maxEntries: 3 } }));
  expect(e.message).toMatch(/more than 3 archive entries/);
  e = await failure(run((u, res) => res.end(two(u.split('/')[1]!)), { limits: { maxTotalBytes: 1000 } }));
  expect(e.message).toMatch(/more than 1000 unpacked bytes/);
});

test('an archive for a different commit is refused', async () => {
  const wrong = gzipSync(tarOf([{ name: 'x/a', data: 'a' }], 'b'.repeat(40)));
  expect((await failure(run(serve(wrong), { repos: ['repo-one'] }))).message).toMatch(/pinned commit/);
  const none = gzipSync(tarOf([{ name: 'x/a', data: 'a' }], null));
  expect((await failure(run(serve(none), { repos: ['repo-one'] }))).message).toMatch(/pinned commit/);
});

test('a corrupt tar header is refused', async () => {
  const t = tarOf([{ name: 'x/a', data: 'a' }]);
  t[1024 + 2] = t[1024 + 2]! ^ 1; // a name byte of the first file header
  expect((await failure(run(serve(gzipSync(t)), { repos: ['repo-one'] }))).message).toMatch(/checksum/);
});

test('an existing destination is refused and any earlier bundle rolled back', async () => {
  hits = [];
  handler = serveGood;
  work = await mkdtemp(join(tmpdir(), 'prf40-'));
  await (await import('node:fs/promises')).mkdir(join(work, 'repo-two'));
  const e = await failure(downloadPrusaVendorBundles({ commit: COMMIT, targetDir: work, baseUrl: base, repos: REPOS }));
  expect(e.message).toMatch(/already exists/);
  expect((await readdir(work)).sort()).toEqual(['repo-two']);
  await expect(stat(join(work, 'repo-two', 'PrusaResearch.ini'))).rejects.toThrow(); // the pre-existing folder untouched
});

test('a destination that appears during the download rolls back the bundle already placed', async () => {
  const { mkdirSync, writeFileSync } = await import('node:fs');
  work = await mkdtemp(join(tmpdir(), 'prf40-'));
  hits = [];
  handler = (u, res) => {
    if (u.startsWith('/repo-two')) {
      mkdirSync(join(work, 'repo-two')); // non-empty, or rename() would replace it
      writeFileSync(join(work, 'repo-two', 'mine'), 'x');
    }
    res.end(good(u.split('/')[1]!));
  };
  const e = await failure(downloadPrusaVendorBundles({ commit: COMMIT, targetDir: work, baseUrl: base, repos: REPOS }));
  expect(e.message).toMatch(/cannot place/);
  expect((await readdir(work)).sort()).toEqual(['repo-two']);
});

test('commit, repo names and limits are validated before any request', async () => {
  const bads: Record<string, unknown>[] = [
    { commit: 'main' },
    { commit: 'A'.repeat(40) },
    { repos: ['../x'] },
    { repos: ['a', 'A'] },
    { repos: [] },
    { baseUrl: 'file:///etc' },
    ...(['timeoutMs', 'maxEntries', 'maxArchiveBytes', 'maxRedirects'] as const).flatMap((k) =>
      [0, -1, NaN, Infinity, 1.5, 2 ** 53].map((v) => ({ limits: { [k]: v } })),
    ),
  ];
  hits = [];
  work = await mkdtemp(join(tmpdir(), 'prf40-'));
  for (const b of bads) {
    const e = await failure(
      downloadPrusaVendorBundles({ commit: COMMIT, targetDir: work, baseUrl: base, repos: REPOS, ...b }),
    );
    expect([JSON.stringify(b), e instanceof DownloadError]).toEqual([JSON.stringify(b), true]);
  }
  expect(hits).toEqual([]);
  expect(DOWNLOAD_LIMITS.maxRedirects).toBe(5);
});

test('hostile responses and bad caller input fail as non-retryable DownloadErrors', async () => {
  let e = await failure(
    run((_u, res) => {
      res.statusCode = 302;
      res.setHeader('location', 'http://[');
      res.end();
    }),
  );
  expect([e instanceof DownloadError, e.retryable]).toEqual([true, false]);
  expect(e.message).toMatch(/invalid Location/);
  work = await mkdtemp(join(tmpdir(), 'prf40-'));
  e = await failure(downloadPrusaVendorBundles({ commit: COMMIT, targetDir: work, baseUrl: 'not a url' }));
  expect([e instanceof DownloadError, e.retryable]).toEqual([true, false]);
  e = await failure(downloadPrusaVendorBundles({ commit: COMMIT, targetDir: join(work, 'missing'), baseUrl: base }));
  expect([e instanceof DownloadError, e.retryable]).toEqual([true, false]);
});

test('each archive bound has its own refusal', async () => {
  const one = (t: Buffer, extra: Record<string, unknown> = {}) =>
    failure(run(serve(gzipSync(t)), { repos: ['repo-one'], ...extra }));
  const pax = Buffer.alloc(70_000, 0x61);
  expect((await one(Buffer.concat([header('x/p', pax.length, 'x'), pad(pax)]))).message).toMatch(/over 64 KiB/);
  expect((await one(tarOf([{ name: 'x/abcdefghijkl' }]), { limits: { maxPathBytes: 10 } })).message).toMatch(
    /path is too long/,
  );
  expect((await one(tarOf([{ name: 'x/a.' }]))).message).toMatch(/trailing dot/);
  const cut = Buffer.concat([header('x/a', 1000, '0'), Buffer.alloc(100)]);
  expect((await one(cut)).message).toMatch(/runs past the end/);
  const e = await failure(run(serveGood, { repos: ['.hidden'] }));
  expect(e.message).toMatch(/invalid repository name/);
});

test('no Prusa data is in the published file list or the module tree', async () => {
  const root = join(import.meta.dirname, '..', '..');
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as { files: string[] };
  expect(pkg.files).toEqual(['dist', 'LICENSE', 'README.md']);
  const walk = async (d: string): Promise<string[]> =>
    (await readdir(d, { withFileTypes: true })).flatMap((e) => (e.isDirectory() ? [] : [e.name]));
  expect((await walk(join(root, 'src'))).filter((f) => /\.(ini|idx)$/i.test(f))).toEqual([]);
});
