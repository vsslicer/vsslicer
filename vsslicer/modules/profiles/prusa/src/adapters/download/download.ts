// SPDX-License-Identifier: AGPL-3.0-or-later
// Fetches the PrusaSlicer vendor-bundle repositories (prusa3d/PrusaSlicer-settings-prusa-fff and -non-prusa-fff,
// AGPL-3.0 data that is never stored in this repository) as GitHub tar.gz archives at one pinned commit and unpacks
// them into a caller-given folder. The archive is untrusted input: every size, count and path is bounded before use.
import { lstat, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

export interface DownloadLimits {
  /** Most compressed bytes of one archive, checked against Content-Length and while streaming. */
  maxArchiveBytes: number;
  /** Most bytes of the unpacked tar stream (headers included) of one archive. */
  maxTarBytes: number;
  /** Most file bytes over all archives of one call. */
  maxTotalBytes: number;
  /** Most entries over all archives of one call. */
  maxEntries: number;
  /** Longest entry path in UTF-8 bytes, and deepest nesting. */
  maxPathBytes: number;
  maxDepth: number;
  maxRedirects: number;
  /** One deadline for the whole call. */
  timeoutMs: number;
}

export const DOWNLOAD_LIMITS: Readonly<DownloadLimits> = Object.freeze({
  maxArchiveBytes: 64 * 1024 * 1024,
  maxTarBytes: 256 * 1024 * 1024,
  maxTotalBytes: 256 * 1024 * 1024,
  maxEntries: 50_000,
  maxPathBytes: 512,
  maxDepth: 16,
  maxRedirects: 5,
  timeoutMs: 120_000,
});

const CEILING = Number.MAX_SAFE_INTEGER;
/** gunzipSync and Buffer cannot hold more than this. */
const BUFFER_CEILING = 2 ** 31 - 1;

export const PRUSA_VENDOR_REPOS = ['PrusaSlicer-settings-prusa-fff', 'PrusaSlicer-settings-non-prusa-fff'] as const;
export const DEFAULT_BASE_URL = 'https://codeload.github.com/prusa3d';

export interface DownloadOptions {
  /** Full 40-hex git commit; branches and tags are refused because they move. */
  commit: string;
  /** Existing folder; each repository lands in `<targetDir>/<repo>`, which must not exist yet. */
  targetDir: string;
  /** Repository names under `baseUrl`; defaults to {@link PRUSA_VENDOR_REPOS}. */
  repos?: readonly string[];
  baseUrl?: string;
  fetch?: typeof fetch;
  limits?: Partial<DownloadLimits>;
}

export interface DownloadedBundle {
  repo: string;
  dir: string;
  files: number;
  /** Ready for `Vendor.source` (format, origin = the URL fetched, commit). */
  source: { format: 'prusa-ini'; origin: string; commit: string };
}

export class DownloadError extends Error {
  override name = 'DownloadError';
  /** True when running the same call again may succeed (network, timeout, 429, 5xx). */
  readonly retryable: boolean;
  constructor(message: string, retryable: boolean) {
    super(message);
    this.retryable = retryable;
  }
}

const bad = (why: string): never => {
  throw new DownloadError(why, false);
};
const transient = (why: string): never => {
  throw new DownloadError(why, true);
};

function resolveLimits(limits: Partial<DownloadLimits> = {}): DownloadLimits {
  const out = { ...DOWNLOAD_LIMITS };
  for (const key of Object.keys(DOWNLOAD_LIMITS) as (keyof DownloadLimits)[]) {
    const v = limits[key];
    if (v === undefined) continue;
    const max =
      key === 'maxArchiveBytes' || key === 'maxTarBytes' ? BUFFER_CEILING : key === 'timeoutMs' ? 3_600_000 : CEILING;
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 1 || v > max)
      bad(`limit ${key} must be an integer from 1 to ${max}, got ${String(v)}`);
    out[key] = v;
  }
  return out;
}

async function get(url: string, doFetch: typeof fetch, limits: DownloadLimits, signal: AbortSignal): Promise<Buffer> {
  let current = new URL(url);
  const scheme = current.protocol;
  for (let hops = 0; ; hops++) {
    if (current.protocol !== scheme) bad(`redirect changes the scheme to ${current.protocol}`);
    let res: Response;
    try {
      res = await doFetch(current, { redirect: 'manual', signal });
    } catch (e) {
      return transient(`${signal.aborted ? 'timed out' : 'network error'} fetching ${url}: ${(e as Error).message}`);
    }
    if (res.status >= 300 && res.status < 400) {
      void res.body?.cancel();
      const location = res.headers.get('location');
      if (hops >= limits.maxRedirects) bad(`more than ${limits.maxRedirects} redirects from ${url}`);
      if (!location) bad(`redirect without a Location from ${current.href}`);
      try {
        current = new URL(location!, current);
      } catch {
        return bad(`redirect from ${current.href} has an invalid Location`);
      }
      continue;
    }
    if (!res.ok || res.body === null) {
      void res.body?.cancel();
      const msg = `${current.href} answered ${res.status}`;
      return res.status === 429 || res.status >= 500 ? transient(msg) : bad(msg);
    }
    const declared = Number(res.headers.get('content-length') ?? 0);
    if (declared > limits.maxArchiveBytes) {
      void res.body.cancel();
      bad(`${current.href} declares ${declared} bytes, over the ${limits.maxArchiveBytes} cap`);
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for await (const chunk of res.body) {
        size += chunk.length;
        if (size > limits.maxArchiveBytes) bad(`${current.href} is over the ${limits.maxArchiveBytes} byte cap`);
        chunks.push(chunk);
      }
    } catch (e) {
      if (e instanceof DownloadError) throw e;
      return transient(`${signal.aborted ? 'timed out' : 'connection lost'} reading ${url}: ${(e as Error).message}`);
    }
    return Buffer.concat(chunks, size);
  }
}

const field = (b: Buffer, off: number, len: number): string => {
  const end = b.indexOf(0, off);
  return b.toString('utf8', off, end >= 0 && end < off + len ? end : off + len);
};

function octal(b: Buffer, off: number, len: number, what: string): number {
  if (b[off]! & 0x80) return bad(`tar ${what} uses base-256, which is not supported`);
  const s = field(b, off, len).trim();
  if (!/^[0-7]{1,12}$/.test(s)) return bad(`tar ${what} is not an octal number`);
  return parseInt(s, 8);
}

/** The reason a tar path component list is unsafe, or undefined. */
function unsafePath(parts: string[], limits: DownloadLimits): string | undefined {
  if (parts.length > limits.maxDepth) return 'too deep';
  for (const p of parts) {
    if (p === '' || p === '.' || p === '..') return 'empty, . or .. component';
    // eslint-disable-next-line no-control-regex
    if (/[\\\0-\x1f\x7f:]/.test(p)) return 'control character, backslash or colon';
    if (p.endsWith('.') || p.endsWith(' ')) return 'trailing dot or space';
  }
  return undefined;
}

interface Budget {
  entries: number;
  bytes: number;
}

interface Unpacked {
  files: Map<string, Buffer>;
  comment: string | undefined;
}

/** Reads a tar stream into memory. Only regular files and directories are accepted; the top folder is stripped. */
function untar(tar: Buffer, limits: DownloadLimits, budget: Budget): Unpacked {
  const files = new Map<string, Buffer>();
  const dirs = new Set<string>();
  const keys = new Set<string>();
  let comment: string | undefined;
  let paxPath: string | undefined;
  let off = 0;
  while (off + 512 <= tar.length) {
    const h = tar.subarray(off, off + 512);
    if (h.every((x) => x === 0)) break;
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : h[i]!;
    if (sum !== octal(h, 148, 8, 'checksum')) bad('tar header checksum mismatch');
    const type = String.fromCharCode(h[156]!);
    const size = octal(h, 124, 12, 'size');
    const body = tar.subarray(off + 512, off + 512 + size);
    if (body.length < size) bad('tar entry runs past the end of the archive');
    off += 512 + Math.ceil(size / 512) * 512;
    if (type === 'g' || type === 'x') {
      if (size > 64 * 1024) bad('tar extended header is over 64 KiB');
      // records are "<len> <key>=<value>\n"; len counts the whole record
      let p = 0;
      while (p < body.length) {
        const sp = body.indexOf(0x20, p);
        const len = sp < 0 ? NaN : Number(body.toString('latin1', p, sp));
        if (!Number.isSafeInteger(len) || len <= sp - p + 1 || p + len > body.length)
          bad('malformed tar extended header');
        const rec = body.toString('utf8', sp + 1, p + len - 1);
        const eq = rec.indexOf('=');
        const key = rec.slice(0, eq);
        if (type === 'g' && key === 'comment') comment = rec.slice(eq + 1);
        if (type === 'x' && key === 'path') paxPath = rec.slice(eq + 1);
        p += len;
      }
      continue;
    }
    const prefix = field(h, 345, 155);
    const raw = paxPath ?? (prefix ? `${prefix}/${field(h, 0, 100)}` : field(h, 0, 100));
    paxPath = undefined;
    if (type !== '0' && type !== '\0' && type !== '5')
      bad(`tar entry of type "${type}" (links and devices) is refused`);
    if (++budget.entries > limits.maxEntries) bad(`more than ${limits.maxEntries} archive entries`);
    if (Buffer.byteLength(raw) > limits.maxPathBytes) bad('archive path is too long');
    const parts = raw.replace(/\/$/, '').split('/');
    const why = unsafePath(parts, limits);
    if (why) bad(`unsafe archive path ${JSON.stringify(raw.slice(0, 80))}: ${why}`);
    const rel = parts.slice(1); // strip the "<repo>-<commit>/" folder
    if (rel.length === 0) continue;
    // Unicode and case aliases would collide on macOS and Windows file systems
    const key = rel.map((p) => p.normalize('NFC').toLowerCase());
    const dirKey = (n: number) => key.slice(0, n).join('/');
    for (let i = 1; i < key.length; i++) {
      if (keys.has(dirKey(i))) bad(`archive path ${JSON.stringify(rel.join('/'))} is under a file`);
      dirs.add(dirKey(i));
    }
    const full = key.join('/');
    if (type === '5') {
      if (keys.has(full)) bad(`archive directory ${JSON.stringify(rel.join('/'))} is also a file`);
      dirs.add(full);
      continue;
    }
    if (keys.has(full) || dirs.has(full))
      bad(`archive path ${JSON.stringify(rel.join('/'))} appears twice or as an alias`);
    budget.bytes += size;
    if (budget.bytes > limits.maxTotalBytes) bad(`more than ${limits.maxTotalBytes} unpacked bytes`);
    keys.add(full);
    files.set(rel.join('/'), Buffer.from(body));
  }
  return { files, comment };
}

/**
 * Downloads each repository at `commit` and places it as `<targetDir>/<repo>`. Unpacking happens in a staging folder
 * inside `targetDir` and each bundle is renamed into place only when complete, so a failure leaves no partial bundle.
 * Throws {@link DownloadError}; `retryable` tells the caller whether trying again can help.
 */
export async function downloadPrusaVendorBundles(options: DownloadOptions): Promise<DownloadedBundle[]> {
  const { commit, targetDir } = options;
  if (!/^[0-9a-f]{40}$/.test(commit)) bad('commit must be a full 40-character lowercase hex git commit');
  const limits = resolveLimits(options.limits);
  const repos = options.repos ?? PRUSA_VENDOR_REPOS;
  if (repos.length === 0 || repos.length > 16) bad('repos must hold 1 to 16 names');
  for (const r of repos)
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(r) || r.startsWith('.')) bad(`invalid repository name ${JSON.stringify(r)}`);
  if (new Set(repos.map((r) => r.toLowerCase())).size !== repos.length) bad('repository names repeat');
  let base: URL;
  try {
    base = new URL(options.baseUrl ?? DEFAULT_BASE_URL);
  } catch {
    return bad('baseUrl is not a valid URL');
  }
  if (base.protocol !== 'https:' && base.protocol !== 'http:') bad('baseUrl must be http or https');
  const doFetch = options.fetch ?? fetch;
  const signal = AbortSignal.timeout(limits.timeoutMs);
  const budget: Budget = { entries: 0, bytes: 0 };

  for (const repo of repos) {
    // rename() would silently replace an empty folder, so look first; the rename error still covers a race
    if (
      await lstat(join(targetDir, repo)).then(
        () => true,
        () => false,
      )
    )
      bad(`cannot place ${repo}: ${join(targetDir, repo)} already exists`);
  }
  let staging: string;
  try {
    staging = await mkdtemp(join(targetDir, '.download-'));
  } catch (e) {
    return bad(`cannot use targetDir ${targetDir}: ${(e as Error).message}`);
  }
  try {
    const unpacked: { repo: string; url: string; files: Map<string, Buffer> }[] = [];
    for (const repo of repos) {
      const url = `${base.href.replace(/\/$/, '')}/${repo}/tar.gz/${commit}`;
      const gz = await get(url, doFetch, limits, signal);
      let tar: Buffer;
      try {
        tar = gunzipSync(gz, { maxOutputLength: limits.maxTarBytes });
      } catch (e) {
        return bad(`${url} is not a gzip archive within ${limits.maxTarBytes} bytes: ${(e as Error).message}`);
      }
      const { files, comment } = untar(tar, limits, budget);
      // GitHub stamps the commit it built the archive from into the tar's global header
      if (comment !== commit) bad(`${url} does not carry the pinned commit (header says ${JSON.stringify(comment)})`);
      unpacked.push({ repo, url, files });
    }
    for (const { repo, files } of unpacked) {
      for (const [rel, data] of files) {
        const path = join(staging, repo, ...rel.split('/'));
        await mkdir(join(path, '..'), { recursive: true });
        await writeFile(path, data, { flag: 'wx' });
      }
      if (files.size === 0) await mkdir(join(staging, repo));
    }
    const out: DownloadedBundle[] = [];
    for (const { repo, url, files } of unpacked) {
      const dir = join(targetDir, repo);
      try {
        await rename(join(staging, repo), dir);
      } catch (e) {
        for (const placed of out) await rm(placed.dir, { recursive: true, force: true }); // all bundles or none
        return bad(`cannot place ${repo} at ${dir} (it may already exist): ${(e as Error).message}`);
      }
      out.push({ repo, dir, files: files.size, source: { format: 'prusa-ini', origin: url, commit } });
    }
    return out;
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
