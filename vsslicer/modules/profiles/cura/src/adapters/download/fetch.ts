// SPDX-License-Identifier: AGPL-3.0-or-later
// Downloads Cura's `resources/{definitions,extruders,variants,quality}` at one commit from GitHub's tarball of that
// commit, for users with no Cura installed. The result is a folder `readCuraResourceFolder` reads, plus `source.json`
// recording `{ format: 'cura', origin, commit }`. The tarball is untrusted input (rule 25): the download, the inflated
// size, the entry count, entry sizes and path length/depth are capped; only regular files under the four folders are
// kept (links, devices and everything else are skipped); names are checked before anything is written; two names
// that alias after NFC + case folding fail the fetch. The folder is built beside the destination and renamed into
// place, so a failure leaves no partial folder. Tar layout: POSIX ustar/pax (GitHub writes a pax global header
// and, for long names, pax `path` records).
import { mkdir, mkdtemp, readFile, rename, rm, writeFile, lstat } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { gunzipSync } from 'node:zlib';

/** Cura@5bea2f8 in full: the revision the importers are written against. */
export const CURA_PINNED_COMMIT = '5bea2f86153faed3a1c2d9081b8d6b753684678a';
export const CURA_ORIGIN = 'https://github.com/Ultimaker/Cura';

export interface CuraFetchLimits {
  /** Most compressed bytes downloaded. */
  maxDownloadBytes: number;
  /** Most bytes after gunzip, tar headers and padding included. */
  maxTarBytes: number;
  /** Most tar entries of any kind. */
  maxEntries: number;
  /** Most files kept. */
  maxFiles: number;
  /** Most bytes in one kept file. */
  maxFileBytes: number;
  /** Most bytes over all kept files. */
  maxTotalBytes: number;
  /** Longest kept path, in characters. */
  maxPathLength: number;
  /** Most folders deep a kept file may sit below `definitions` etc. */
  maxDepth: number;
}

export const CURA_FETCH_LIMITS: Readonly<CuraFetchLimits> = Object.freeze({
  maxDownloadBytes: 256 * 1024 * 1024,
  maxTarBytes: 512 * 1024 * 1024,
  maxEntries: 100_000,
  maxFiles: 20_000,
  maxFileBytes: 16 * 1024 * 1024,
  maxTotalBytes: 128 * 1024 * 1024,
  maxPathLength: 512,
  maxDepth: 16,
});

export interface CuraFetchOptions {
  /** Full 40-digit lowercase commit hash; defaults to {@link CURA_PINNED_COMMIT}. */
  commit?: string;
  /** Defaults to the global `fetch`; tests pass a fake. */
  fetch?: (url: string, init?: { signal?: AbortSignal }) => Promise<Response>;
  /** A folder (outside the repository) keeping `<commit>.tar.gz` between runs; a cached file is used without the network. */
  cacheDir?: string;
  limits?: Partial<CuraFetchLimits>;
  /** Longest wait for the response, and between two body chunks, in ms (default 30000); a stall is a retryable error. */
  idleTimeoutMs?: number;
}

export type CuraFetchResult =
  | { ok: true; source: { format: 'cura'; origin: string; commit: string }; files: number }
  | { ok: false; retryable: boolean; error: string };

const FOLDERS = new Set(['definitions', 'extruders', 'variants', 'quality']);
const OCTAL = /^[0-7]+$/;
const SHA = /^[0-9a-f]{40}$/;
const dec = new TextDecoder('utf-8', { fatal: true });

class Refused extends Error {
  readonly retryable: boolean;
  constructor(message: string, retryable = false) {
    super(message);
    this.retryable = retryable;
  }
}

function resolveLimits(given: Partial<CuraFetchLimits> = {}): CuraFetchLimits {
  const out = { ...CURA_FETCH_LIMITS };
  for (const key of Object.keys(CURA_FETCH_LIMITS) as (keyof CuraFetchLimits)[]) {
    const v = given[key];
    if (v === undefined) continue;
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 1)
      throw new Refused(`limit ${key} must be a positive integer`);
    out[key] = v;
  }
  return out;
}

const cString = (b: Uint8Array): string => {
  const end = b.indexOf(0);
  return dec.decode(end < 0 ? b : b.subarray(0, end));
};

/** Pax records `<len> <key>=<value>\n`; returns the `path` value if present. */
function paxPath(data: Uint8Array): string | undefined {
  let at = 0;
  let path: string | undefined;
  while (at < data.length) {
    let sp = at;
    while (sp < data.length && data[sp] !== 0x20 && sp - at < 10) sp++;
    const len = Number(dec.decode(data.subarray(at, sp)));
    if (!Number.isSafeInteger(len) || len < sp - at + 2 || at + len > data.length)
      throw new Refused('corrupt pax header');
    const rec = dec.decode(data.subarray(sp + 1, at + len - 1));
    if (rec.startsWith('path=')) path = rec.slice(5);
    at += len;
  }
  return path;
}

/** The kept relative path (`definitions/x.def.json`) for a tar entry name, `undefined` to skip it, or throws. */
function keptPath(name: string, lim: CuraFetchLimits): string | undefined {
  const slash = name.indexOf('/'); // the first segment is `Cura-<commit>`
  const rel = slash < 0 ? '' : name.slice(slash + 1);
  const segs = rel.split('/');
  if (segs[0] !== 'resources' || !FOLDERS.has(segs[1] ?? '') || segs.length < 3) return undefined;
  const kept = segs.slice(2);
  if (kept.some((s) => s.startsWith('.'))) return undefined; // Cura skips dot names too
  if (kept.length - 1 > lim.maxDepth) throw new Refused(`${rel.slice(0, 80)} is deeper than ${lim.maxDepth} folders`);
  if (kept.join('/').length > lim.maxPathLength)
    throw new Refused(`a path is longer than ${lim.maxPathLength} characters`);
  // Anything that cannot be a plain name on every file system is refused, not skipped: a silent gap is worse.
  if (kept.some((s) => s === '' || s === '..' || /[\\:<>"|?*]|[. ]$/.test(s) || [...s].some((c) => c < ' ')))
    throw new Refused(`unsafe path ${JSON.stringify(rel.slice(0, 80))}`);
  return `${segs[1]}/${kept.join('/')}`;
}

/** Kept files of a tar, in archive order. Exported for tests. */
export function readCuraTar(tar: Uint8Array, limits?: Partial<CuraFetchLimits>): Map<string, Uint8Array> {
  const lim = resolveLimits(limits);
  const files = new Map<string, Uint8Array>();
  const seen = new Set<string>();
  let total = 0;
  let entries = 0;
  let longName: string | undefined;
  for (let at = 0; ;) {
    if (at + 512 > tar.length) throw new Refused('truncated tar');
    const head = tar.subarray(at, at + 512);
    if (head.every((b) => b === 0)) break;
    if (++entries > lim.maxEntries) throw new Refused(`more than ${lim.maxEntries} tar entries`);
    const sizeText = cString(head.subarray(124, 136)).trim();
    if (!OCTAL.test(sizeText)) throw new Refused('corrupt tar: bad size field');
    const size = parseInt(sizeText, 8);
    const type = String.fromCharCode(head[156] || 0x30);
    const dataAt = at + 512;
    if (!Number.isSafeInteger(size) || dataAt + size > tar.length) throw new Refused('truncated tar');
    at = dataAt + Math.ceil(size / 512) * 512;
    if (type === 'x' || type === 'g') {
      if (size > 65536) throw new Refused('pax header over 64 KiB');
      if (type === 'x') longName = paxPath(tar.subarray(dataAt, dataAt + size));
      continue;
    }
    const prefix = cString(head.subarray(345, 500));
    const name = longName ?? (prefix ? `${prefix}/` : '') + cString(head.subarray(0, 100));
    longName = undefined;
    if (type !== '0') continue; // links, directories, devices, GNU long names: not kept
    const path = keptPath(name, lim);
    if (path === undefined) continue;
    const key = path.normalize('NFC').toLowerCase();
    if (seen.has(key))
      throw new Refused(`two entries share the name ${JSON.stringify(path.slice(0, 80))} after case folding`);
    seen.add(key);
    if (files.size + 1 > lim.maxFiles) throw new Refused(`more than ${lim.maxFiles} files`);
    if (size > lim.maxFileBytes) throw new Refused(`${path.slice(0, 80)} is over ${lim.maxFileBytes} bytes`);
    total += size;
    if (total > lim.maxTotalBytes) throw new Refused(`more than ${lim.maxTotalBytes} bytes of files`);
    files.set(path, tar.subarray(dataAt, dataAt + size));
  }
  return files;
}

/** Races `p` against an idle timer; on expiry aborts the request and refuses with a retryable error. */
function within<T>(p: Promise<T>, ms: number, ac: AbortController): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      ac.abort();
      reject(new Refused(`download stalled for ${ms} ms`, true));
    }, ms);
    p.then(
      (v) => (clearTimeout(t), resolve(v)),
      (e) => (clearTimeout(t), reject(e)),
    );
  });
}

async function download(
  commit: string,
  o: CuraFetchOptions,
  lim: CuraFetchLimits,
  idleMs: number,
): Promise<Uint8Array> {
  const ac = new AbortController();
  let res: Response;
  try {
    res = await within(
      Promise.resolve(
        (o.fetch ?? fetch)(`https://codeload.github.com/Ultimaker/Cura/tar.gz/${commit}`, { signal: ac.signal }),
      ),
      idleMs,
      ac,
    );
  } catch (e) {
    if (e instanceof Refused) throw e;
    throw new Refused(`download failed: ${(e as Error).message}`, true);
  }
  if (!res.ok)
    throw new Refused(
      `download failed: HTTP ${res.status}`,
      res.status >= 500 || res.status === 429 || res.status === 408,
    );
  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > lim.maxDownloadBytes) throw new Refused(`download is over ${lim.maxDownloadBytes} bytes`);
  const chunks: Uint8Array[] = [];
  let got = 0;
  const it = (res.body as unknown as AsyncIterable<Uint8Array>)[Symbol.asyncIterator]();
  try {
    for (;;) {
      const r = await within(it.next(), idleMs, ac);
      if (r.done) break;
      got += r.value.length;
      if (got > lim.maxDownloadBytes) throw new Refused(`download is over ${lim.maxDownloadBytes} bytes`);
      chunks.push(r.value);
    }
  } catch (e) {
    if (e instanceof Refused) throw e;
    throw new Refused(`download failed: ${(e as Error).message}`, true);
  } finally {
    Promise.resolve(it.return?.()).catch(() => {}); // cancel the body; never await a stalled one
  }
  return Buffer.concat(chunks);
}

/** The kept files of a gzipped tarball; throws a non-retryable refusal if it is not a usable Cura archive. */
function unpack(gz: Uint8Array, lim: CuraFetchLimits): Map<string, Uint8Array> {
  let tar: Uint8Array;
  try {
    tar = gunzipSync(gz, { maxOutputLength: lim.maxTarBytes });
  } catch (e) {
    throw new Refused(`not a usable gzip stream: ${(e as Error).message}`);
  }
  const files = readCuraTar(tar, lim);
  if (files.size === 0) throw new Refused('archive holds no Cura resources');
  return files;
}

/** Cached tarball first (a cached file that is too big or does not unpack is dropped), else the network. */
async function obtain(commit: string, o: CuraFetchOptions, lim: CuraFetchLimits, idleMs: number) {
  const cached = o.cacheDir ? join(o.cacheDir, `${commit}.tar.gz`) : undefined;
  if (cached) {
    try {
      const bytes = await readFile(cached);
      if (bytes.length <= lim.maxDownloadBytes) return { files: unpack(bytes, lim) };
    } catch {
      // not cached, or unusable: a cache miss
    }
    await rm(cached, { force: true });
  }
  const gz = await download(commit, o, lim, idleMs);
  const files = unpack(gz, lim);
  if (cached) {
    // Only a tarball that unpacked is kept. A cache that cannot be written only costs the next download.
    try {
      await mkdir(o.cacheDir!, { recursive: true });
      const tmp = `${cached}.${process.pid}.tmp`;
      await writeFile(tmp, gz);
      await rename(tmp, cached);
    } catch {
      // ignored
    }
  }
  return { files };
}

/**
 * Fetches Cura's resources at `commit` into `dest`, which must not exist. On any failure `dest` is not created and the
 * result says whether trying again can help (network and 5xx/429 errors) or not (bad archive, bad input, limits).
 */
export async function fetchCuraResources(dest: string, options: CuraFetchOptions = {}): Promise<CuraFetchResult> {
  let tmp: string | undefined;
  try {
    const commit = options.commit ?? CURA_PINNED_COMMIT;
    if (!SHA.test(commit)) throw new Refused('commit must be 40 lowercase hex digits');
    const lim = resolveLimits(options.limits);
    if (
      await lstat(dest).then(
        () => true,
        () => false,
      )
    )
      throw new Refused('destination already exists');
    const idleMs = options.idleTimeoutMs ?? 30_000;
    if (!Number.isSafeInteger(idleMs) || idleMs < 1) throw new Refused('idleTimeoutMs must be a positive integer');
    const { files } = await obtain(commit, options, lim, idleMs);
    await mkdir(dirname(dest), { recursive: true });
    tmp = await mkdtemp(join(dirname(dest), `.${basename(dest)}.part-`));
    for (const [path, bytes] of files) {
      const to = join(tmp, path);
      await mkdir(dirname(to), { recursive: true });
      await writeFile(to, bytes, { flag: 'wx' });
    }
    const source = { format: 'cura' as const, origin: CURA_ORIGIN, commit };
    await writeFile(join(tmp, 'source.json'), JSON.stringify(source, null, 2) + '\n', { flag: 'wx' });
    await rename(tmp, dest);
    tmp = undefined;
    return { ok: true, source, files: files.size };
  } catch (e) {
    return { ok: false, retryable: e instanceof Refused ? e.retryable : false, error: (e as Error).message };
  } finally {
    if (tmp) await rm(tmp, { recursive: true, force: true });
  }
}
