// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readlink,
  realpath,
  rename,
  rm,
  symlink,
  type FileHandle,
} from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { createGunzip, crc32 } from 'node:zlib';
import { Inflate } from 'fflate';

/** Bounds applied to an untrusted archive while it is read and inflated. */
export interface ExtractLimits {
  maxEntries: number;
  /** UTF-8 bytes of an entry path (and of a symlink target). */
  maxPathBytes: number;
  maxFileBytes: number;
  maxTotalBytes: number;
  /** Inflated:compressed ratio refused once more than `ratioFloorBytes` have been inflated. */
  maxRatio: number;
  ratioFloorBytes: number;
}

export const EXTRACT_LIMITS: Readonly<ExtractLimits> = {
  maxEntries: 100_000,
  maxPathBytes: 4096,
  maxFileBytes: 1024 ** 3,
  maxTotalBytes: 4 * 1024 ** 3,
  maxRatio: 1000,
  ratioFloorBytes: 1024 ** 2,
};

export interface ExtractResult {
  format: 'zip' | 'tar.gz';
  /** Files, directories and symlinks written. */
  entries: number;
  /** File bytes written. */
  bytes: number;
}

export interface ExtractOptions {
  /** Hex sha256 of the archive file, checked before anything is extracted. Required for tar.gz. */
  sha256?: string;
}

export class ArchiveError extends Error {
  override name = 'ArchiveError';
}

const CHUNK = 16 * 1024; // inflate input per push: at most ~16 MiB of output per step

/**
 * Extracts a zip or tar.gz (detected by magic bytes) into `dest`, which must not exist yet.
 * Writes into a sibling staging directory and renames it to `dest` only on success; any failure removes it.
 * Rejects `..`, absolute and drive paths, symlinks resolving outside `dest` (by the archive's own links, then on
 * disk), hard links, device files, duplicate paths, encrypted or zip64 zips, bad tar checksums and anything past `limits`.
 * A tar.gz needs `opts.sha256` (its inflated size is bounded only by the ratio, so an unverified one is refused);
 * a given sha256 is verified for a zip too.
 */
export async function extractArchive(
  archive: string,
  dest: string,
  limits: Partial<ExtractLimits> = {},
  opts: ExtractOptions = {},
): Promise<ExtractResult> {
  const lim = checkLimits(limits);
  if (opts.sha256 !== undefined && !/^[0-9a-f]{64}$/i.test(opts.sha256))
    throw new RangeError('sha256: 64 hex digits required');
  if (await exists(dest)) throw new ArchiveError(`destination already exists: ${dest}`);
  const fh = await open(archive, 'r');
  // Everything after `open` sits inside this try, so every path closes the handle.
  try {
    let format: ExtractResult['format'];
    const magic = Buffer.alloc(4);
    await fh.read(magic, 0, 4, 0);
    if (magic.readUInt32LE(0) === 0x04034b50) format = 'zip';
    else if (magic[0] === 0x1f && magic[1] === 0x8b) format = 'tar.gz';
    else throw new ArchiveError('not a zip or gzip archive');
    if (format === 'tar.gz' && opts.sha256 === undefined)
      throw new ArchiveError('a tar.gz needs a sha256 to be checked before extraction');
    if (opts.sha256 !== undefined) {
      const got = await sha256Of(fh);
      if (got !== opts.sha256.toLowerCase())
        throw new ArchiveError(`archive sha256 ${got} does not match the expected ${opts.sha256.toLowerCase()}`);
    }
    await mkdir(dirname(dest), { recursive: true });
    const staging = await mkdtemp(join(dirname(dest), `.${basename(dest)}.partial-`));
    const out = new Output(staging, lim);
    try {
      if (format === 'zip') await readZip(fh, out, lim);
      else await readTarGz(fh, out, lim);
      await out.finish();
      await rename(staging, dest);
      return { format, entries: out.entries, bytes: out.bytes };
    } catch (e) {
      await rm(staging, { recursive: true, force: true });
      throw e;
    }
  } finally {
    await fh.close().catch(() => undefined);
  }
}

// Hash, zip read and tar.gz read all use the one descriptor, so the verified bytes are the extracted bytes.
async function sha256Of(fh: FileHandle): Promise<string> {
  const h = createHash('sha256');
  for await (const c of fh.createReadStream({ start: 0, autoClose: false })) h.update(c as Buffer);
  return h.digest('hex');
}

function checkLimits(over: Partial<ExtractLimits>): ExtractLimits {
  const lim = { ...EXTRACT_LIMITS, ...over };
  for (const k of Object.keys(EXTRACT_LIMITS) as (keyof ExtractLimits)[]) {
    const v = lim[k];
    if (!Number.isSafeInteger(v) || v < 1 || v > EXTRACT_LIMITS[k])
      throw new RangeError(`${k}: integer in 1..${EXTRACT_LIMITS[k]} required`);
  }
  return lim;
}

const exists = (p: string) =>
  lstat(p).then(
    () => true,
    (e: NodeJS.ErrnoException) => (e.code === 'ENOENT' ? false : Promise.reject(e)),
  );

/** Validates an untrusted entry name and returns its normalised relative parts. */
export function safeParts(name: string, maxBytes: number): string[] {
  if (Buffer.byteLength(name) > maxBytes) throw new ArchiveError(`path longer than ${maxBytes} bytes`);
  const shown = JSON.stringify(name.slice(0, 200));
  if (name.includes('\0') || name.includes('\\')) throw new ArchiveError(`bad character in path ${shown}`);
  if (name.startsWith('/') || /^[a-zA-Z]:/.test(name)) throw new ArchiveError(`absolute path ${shown}`);
  const parts = name.split('/').filter((p) => p !== '' && p !== '.');
  if (parts.includes('..')) throw new ArchiveError(`path traversal ${shown}`);
  if (parts.length === 0) throw new ArchiveError(`empty path ${shown}`);
  return parts;
}

/**
 * Resolves each symlink entry (archive-relative name -> target) the way a POSIX kernel does, following the
 * archive's other symlink entries, and refuses any resolution that steps above the root, even transiently.
 * It reads the archive only, never the disk: Windows resolves `..` in a relative link target lexically, so
 * there `sub/e -> c/../..` (with `sub/c -> ..`) stays inside and realpath passes it, yet it escapes on POSIX.
 */
export function checkSymlinkChains(links: ReadonlyMap<string, string>, maxSteps: number): void {
  let steps = 0;
  for (const [name, target] of links) {
    const escapes = () =>
      new ArchiveError(`symlink ${JSON.stringify(name)} -> ${JSON.stringify(target)} escapes target`);
    if (target.startsWith('/')) throw escapes();
    const cur = name.split('/').slice(0, -1);
    const todo = target.split('/').reverse(); // a stack, next component last
    let hops = 0;
    while (todo.length > 0) {
      if (++steps > maxSteps) throw new ArchiveError('symlink chains too long to check');
      const part = todo.pop()!;
      if (part === '' || part === '.') continue;
      if (part === '..') {
        if (cur.pop() === undefined) throw escapes();
        continue;
      }
      cur.push(part);
      const next = links.get(cur.join('/'));
      if (next === undefined) continue;
      if (++hops > 40) throw new ArchiveError(`symlink ${JSON.stringify(name)} is dangling or loops`); // Linux MAXSYMLINKS
      if (next.startsWith('/')) throw escapes();
      cur.pop();
      todo.push(...next.split('/').reverse());
    }
  }
}

type Kind = 'file' | 'dir' | 'symlink';

/** Writes entries under the staging root; symlinks are created last and then resolved, so nothing is written through one. */
class Output {
  entries = 0;
  bytes = 0;
  private readonly seen = new Set<string>();
  private readonly realDirs = new Set<string>();
  private readonly links: { path: string; target: string }[] = [];
  /** Archive-relative symlink name -> target, for checkSymlinkChains. */
  private readonly linkTargets = new Map<string, string>();
  private readonly root: string;
  private readonly lim: ExtractLimits;
  constructor(root: string, lim: ExtractLimits) {
    this.root = root;
    this.lim = lim;
  }

  private claim(name: string, kind: Kind): string {
    if (++this.entries > this.lim.maxEntries) throw new ArchiveError(`more than ${this.lim.maxEntries} entries`);
    const rel = safeParts(name, this.lim.maxPathBytes).join('/');
    if (this.seen.has(rel) && kind !== 'dir') throw new ArchiveError(`duplicate entry ${JSON.stringify(rel)}`);
    this.seen.add(rel);
    const path = join(this.root, rel);
    if (!path.startsWith(this.root + sep)) throw new ArchiveError(`path escapes target ${JSON.stringify(rel)}`);
    return path;
  }

  async dir(name: string): Promise<void> {
    await this.mkdirs(this.claim(name, 'dir'));
  }

  /**
   * Creates `path` and its parents one component at a time from the root, refusing any component that is a
   * symlink or not a directory. File-system level, so names aliased by Unicode normalisation or case still hit it.
   */
  private async mkdirs(path: string): Promise<void> {
    let cur = this.root;
    for (const part of path.slice(this.root.length + 1).split(sep)) {
      cur = join(cur, part);
      if (this.realDirs.has(cur)) continue;
      try {
        await mkdir(cur);
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
      }
      const st = await lstat(cur);
      if (!st.isDirectory() || st.isSymbolicLink())
        throw new ArchiveError(`${JSON.stringify(cur.slice(this.root.length + 1))} is not a real directory`);
      this.realDirs.add(cur);
    }
  }

  symlink(name: string, target: string): void {
    const path = this.claim(name, 'symlink');
    if (target === '' || target.includes('\0') || Buffer.byteLength(target) > this.lim.maxPathBytes)
      throw new ArchiveError(`bad symlink target for ${JSON.stringify(name)}`);
    if (isAbsolute(target) || target.startsWith('/') || /^[a-zA-Z]:/.test(target) || target.includes('\\'))
      throw new ArchiveError(`symlink ${JSON.stringify(name)} has an absolute target`);
    const lexical = resolve(dirname(path), target); // realpath in finish() catches escapes through other links
    if (!lexical.startsWith(this.root + sep) && lexical !== this.root)
      throw new ArchiveError(`symlink ${JSON.stringify(name)} -> ${JSON.stringify(target)} escapes target`);
    this.links.push({ path, target });
    this.linkTargets.set(
      path
        .slice(this.root.length + 1)
        .split(sep)
        .join('/'),
      target,
    );
  }

  /** Opens a new file; `write` counts bytes against the per-file and total limits. */
  async file(name: string, mode: number): Promise<FileSink> {
    const path = this.claim(name, 'file');
    if (dirname(path) !== this.root) await this.mkdirs(dirname(path));
    let fh: FileHandle;
    try {
      fh = await open(path, 'wx', 0o600);
    } catch (e) {
      // names aliased by Unicode normalisation or case reach the same file
      if ((e as NodeJS.ErrnoException).code === 'EEXIST')
        throw new ArchiveError(`${name}: collides with another entry`);
      throw e;
    }
    let size = 0;
    return {
      write: async (b: Uint8Array) => {
        size += b.length;
        this.bytes += b.length;
        if (size > this.lim.maxFileBytes)
          throw new ArchiveError(`${name}: file larger than ${this.lim.maxFileBytes} bytes`);
        if (this.bytes > this.lim.maxTotalBytes)
          throw new ArchiveError(`archive larger than ${this.lim.maxTotalBytes} bytes in total`);
        await fh.write(b);
      },
      close: async () => {
        await fh.close();
        await chmod(path, mode & 0o755); // keeps exec bits, drops setuid/setgid/sticky and group/other write
      },
      abort: () => fh.close().catch(() => undefined),
    };
  }

  async finish(): Promise<void> {
    // Refuse any entry under a symlink entry, before any link exists, so no mkdir or symlink goes through one.
    const all = [...this.seen].sort();
    for (const { path } of this.links) {
      const under = path.slice(this.root.length + 1) + '/';
      let lo = 0;
      let hi = all.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (all[mid]! < under) lo = mid + 1;
        else hi = mid;
      }
      if (all[lo]?.startsWith(under)) throw new ArchiveError(`${JSON.stringify(all[lo])} is inside a symlink entry`);
    }
    checkSymlinkChains(this.linkTargets, this.lim.maxEntries * 64);
    const root = await realpath(this.root);
    for (const { path, target } of this.links) {
      if (dirname(path) !== this.root) await this.mkdirs(dirname(path));
      const parent = await realpath(dirname(path));
      if (parent !== root && !parent.startsWith(root + sep))
        throw new ArchiveError(`symlink ${JSON.stringify(path.slice(this.root.length + 1))} parent escapes target`);
      try {
        await symlink(target, path);
      } catch (e) {
        // names aliased by Unicode normalisation or case reach an existing entry
        if ((e as NodeJS.ErrnoException).code === 'EEXIST')
          throw new ArchiveError(`${JSON.stringify(path.slice(this.root.length + 1))}: collides with another entry`);
        throw e;
      }
    }
    for (const { path } of this.links) {
      let real: string;
      try {
        real = await realpath(path);
      } catch {
        throw new ArchiveError(`symlink ${JSON.stringify(path.slice(this.root.length + 1))} is dangling or loops`);
      }
      if (real !== root && !real.startsWith(root + sep))
        throw new ArchiveError(
          `symlink ${JSON.stringify(path.slice(this.root.length + 1))} -> ${JSON.stringify(await readlink(path))} escapes target`,
        );
    }
  }
}

interface FileSink {
  write(b: Uint8Array): Promise<void>;
  close(): Promise<void>;
  abort(): Promise<void>;
}

function checkRatio(out: number, input: number, lim: ExtractLimits, what: string): void {
  if (out > lim.ratioFloorBytes && out > lim.maxRatio * Math.max(input, 1))
    throw new ArchiveError(`${what}: compression ratio over ${lim.maxRatio}:1 (archive bomb)`);
}

// ---------- zip ----------

const S_IFMT = 0o170000;
const S_IFREG = 0o100000;
const S_IFDIR = 0o040000;
const S_IFLNK = 0o120000;

async function readAt(fh: FileHandle, pos: number, len: number): Promise<Buffer> {
  const b = Buffer.alloc(len);
  const { bytesRead } = await fh.read(b, 0, len, pos);
  if (bytesRead !== len) throw new ArchiveError('zip truncated');
  return b;
}

async function readZip(fh: FileHandle, out: Output, lim: ExtractLimits): Promise<void> {
  const fileSize = (await fh.stat()).size;
  const tailLen = Math.min(fileSize, 22 + 0xffff);
  const tail = await readAt(fh, fileSize - tailLen, tailLen);
  let eocd = -1;
  for (let i = tail.length - 22; i >= 0; i--)
    if (tail.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  if (eocd < 0) throw new ArchiveError('zip end of central directory not found');
  const disk = tail.readUInt16LE(eocd + 4);
  const cdDisk = tail.readUInt16LE(eocd + 6);
  const count = tail.readUInt16LE(eocd + 10);
  const cdSize = tail.readUInt32LE(eocd + 12);
  const cdOff = tail.readUInt32LE(eocd + 16);
  // shortcut: zip64 (archives over 4 GiB or 65,535 entries) is refused; add it if an engine ships one
  if (count === 0xffff || cdSize === 0xffffffff || cdOff === 0xffffffff)
    throw new ArchiveError('zip64 is not supported');
  if (disk !== 0 || cdDisk !== 0) throw new ArchiveError('multi-disk zip is not supported');
  if (count > lim.maxEntries) throw new ArchiveError(`more than ${lim.maxEntries} entries`);
  if (cdOff + cdSize > fileSize - tailLen + eocd) throw new ArchiveError('zip central directory out of range');
  const cd = await readAt(fh, cdOff, cdSize);
  await checkNoOverlap(fh, cd, count, cdOff);
  let p = 0;
  for (let n = 0; n < count; n++) {
    if (p + 46 > cd.length || cd.readUInt32LE(p) !== 0x02014b50)
      throw new ArchiveError('zip central directory corrupt');
    const madeBy = cd.readUInt16LE(p + 4) >> 8;
    const flags = cd.readUInt16LE(p + 8);
    const method = cd.readUInt16LE(p + 10);
    const crc = cd.readUInt32LE(p + 16);
    const csize = cd.readUInt32LE(p + 20);
    const usize = cd.readUInt32LE(p + 24);
    const nameLen = cd.readUInt16LE(p + 28);
    const next = p + 46 + nameLen + cd.readUInt16LE(p + 30) + cd.readUInt16LE(p + 32);
    const attrs = cd.readUInt32LE(p + 38);
    const local = cd.readUInt32LE(p + 42);
    if (next > cd.length) throw new ArchiveError('zip central directory corrupt');
    const name = cd.toString('utf8', p + 46, p + 46 + nameLen);
    p = next;
    if (flags & 1) throw new ArchiveError(`${name}: encrypted zip entries are not supported`);
    if (method !== 0 && method !== 8) throw new ArchiveError(`${name}: compression method ${method} not supported`);
    const unixMode = madeBy === 3 ? attrs >>> 16 : 0;
    const type = unixMode & S_IFMT;
    if (type !== 0 && type !== S_IFREG && type !== S_IFDIR && type !== S_IFLNK)
      throw new ArchiveError(`${name}: device files and fifos are refused`);
    if (type === S_IFDIR || (type === 0 && name.endsWith('/'))) {
      await out.dir(name);
      continue;
    }
    if (usize > lim.maxFileBytes) throw new ArchiveError(`${name}: file larger than ${lim.maxFileBytes} bytes`);
    const lh = await readAt(fh, local, 30);
    if (lh.readUInt32LE(0) !== 0x04034b50) throw new ArchiveError(`${name}: local header missing`);
    const start = local + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28);
    if (start + csize > cdOff) throw new ArchiveError(`${name}: data out of range`);
    if (type === S_IFLNK) {
      if (csize > lim.maxPathBytes * 2 + 64) throw new ArchiveError(`${name}: symlink target too long`);
      const chunks: Uint8Array[] = [];
      await inflateEntry(fh, start, csize, method, name, lim, async (b) => void chunks.push(b));
      out.symlink(name, Buffer.concat(chunks).toString('utf8'));
      continue;
    }
    const sink = await out.file(name, unixMode & 0o7777 || 0o644);
    try {
      const got = await inflateEntry(fh, start, csize, method, name, lim, async (b) => {
        checkRatio(out.bytes + b.length, fileSize, lim, 'zip'); // whole archive, not just this entry
        await sink.write(b);
      });
      if (got.size !== usize || got.crc !== crc) throw new ArchiveError(`${name}: size or CRC mismatch`);
    } catch (e) {
      await sink.abort();
      throw e;
    }
    await sink.close();
  }
}

/** Refuses entries whose [local header, data end) ranges overlap: several entries sharing one deflate stream is a bomb. */
async function checkNoOverlap(fh: FileHandle, cd: Buffer, count: number, cdOff: number): Promise<void> {
  const ranges: [number, number][] = [];
  for (let n = 0, p = 0; n < count; n++) {
    if (p + 46 > cd.length || cd.readUInt32LE(p) !== 0x02014b50)
      throw new ArchiveError('zip central directory corrupt');
    const csize = cd.readUInt32LE(p + 20);
    const local = cd.readUInt32LE(p + 42);
    p += 46 + cd.readUInt16LE(p + 28) + cd.readUInt16LE(p + 30) + cd.readUInt16LE(p + 32);
    if (local + 30 > cdOff) throw new ArchiveError('zip local header out of range');
    const lh = await readAt(fh, local, 30);
    ranges.push([local, local + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28) + csize]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < ranges.length; i++)
    if (ranges[i]![0] < ranges[i - 1]![1]) throw new ArchiveError('zip entries overlap (archive bomb)');
}

async function inflateEntry(
  fh: FileHandle,
  start: number,
  csize: number,
  method: number,
  name: string,
  lim: ExtractLimits,
  write: (b: Uint8Array) => Promise<void>,
): Promise<{ size: number; crc: number }> {
  let size = 0;
  let crc = 0;
  let pending: Uint8Array[] = [];
  let done = method === 0;
  const inf = new Inflate((chunk, final) => {
    pending.push(chunk.slice());
    if (final) done = true;
  });
  for (let off = 0; off < csize || (off === 0 && csize === 0);) {
    const len = Math.min(CHUNK, csize - off);
    const buf = len > 0 ? await readAt(fh, start + off, len) : new Uint8Array(0);
    off += len;
    if (method === 0) pending.push(buf);
    else {
      try {
        inf.push(buf, off >= csize);
      } catch (e) {
        throw new ArchiveError(`${name}: ${(e as Error).message}`);
      }
    }
    for (const b of pending) {
      size += b.length;
      if (size > lim.maxFileBytes) throw new ArchiveError(`${name}: file larger than ${lim.maxFileBytes} bytes`);
      checkRatio(size, off, lim, name);
      crc = crc32(b, crc);
      await write(b);
    }
    pending = [];
    if (csize === 0) break;
  }
  if (!done) throw new ArchiveError(`${name}: deflate stream truncated`);
  return { size, crc };
}

// ---------- tar.gz ----------

/** Pulls exact byte counts out of an async chunk stream. */
class Reader {
  private buf: Buffer = Buffer.alloc(0);
  out = 0;
  private readonly it: AsyncIterator<Buffer>;
  constructor(it: AsyncIterator<Buffer>) {
    this.it = it;
  }

  /** Up to `max` bytes (at least one), or null at end of stream. */
  async some(max: number): Promise<Buffer | null> {
    if (this.buf.length === 0) {
      const r = await this.it.next().catch((e: Error) => {
        throw new ArchiveError(`gzip: ${e.message}`); // only errors raised by gunzip or the file read get this label
      });
      if (r.done) return null;
      this.buf = r.value;
      this.out += r.value.length;
    }
    const b = this.buf.subarray(0, max);
    this.buf = this.buf.subarray(b.length);
    return b;
  }

  async exact(n: number): Promise<Buffer> {
    const parts: Buffer[] = [];
    for (let got = 0; got < n;) {
      const b = await this.some(n - got);
      if (!b) throw new ArchiveError('tar truncated');
      parts.push(b);
      got += b.length;
    }
    return Buffer.concat(parts, n);
  }
}

const field = (h: Buffer, off: number, len: number) => {
  const end = h.indexOf(0, off);
  return h.toString('utf8', off, end < 0 || end > off + len ? off + len : end);
};

function octal(h: Buffer, off: number, len: number, what: string): number {
  if (h[off]! & 0x80) throw new ArchiveError(`tar ${what}: base-256 numbers are not supported`);
  const s = field(h, off, len).trim();
  if (!/^[0-7]{0,12}$/.test(s)) throw new ArchiveError(`tar ${what}: bad octal field`);
  return s === '' ? 0 : parseInt(s, 8);
}

function checksumOk(h: Buffer): boolean {
  const want = octal(h, 148, 8, 'checksum');
  let unsigned = 0;
  let signed = 0;
  for (let i = 0; i < 512; i++) {
    const v = i >= 148 && i < 156 ? 0x20 : h[i]!;
    unsigned += v;
    signed += v > 127 ? v - 256 : v;
  }
  return want === unsigned || want === signed;
}

/** pax extended header: "<len> key=value\n" records. */
function parsePax(b: Buffer): Record<string, string> {
  const rec: Record<string, string> = {};
  let p = 0;
  while (p < b.length) {
    const sp = b.indexOf(0x20, p);
    const len = sp < 0 ? NaN : Number(b.toString('ascii', p, sp));
    if (!Number.isSafeInteger(len) || len <= sp - p || p + len > b.length)
      throw new ArchiveError('tar pax header corrupt');
    const kv = b.toString('utf8', sp + 1, p + len - 1);
    const eq = kv.indexOf('=');
    if (eq > 0) rec[kv.slice(0, eq)] = kv.slice(eq + 1);
    p += len;
  }
  return rec;
}

async function readTarGz(fh: FileHandle, out: Output, lim: ExtractLimits): Promise<void> {
  const size = (await fh.stat()).size;
  const file = fh.createReadStream({ start: 0, autoClose: false, highWaterMark: CHUNK });
  const gunzip = createGunzip({ chunkSize: CHUNK });
  file.on('error', (e) => gunzip.destroy(e));
  file.pipe(gunzip);
  const r = new Reader(gunzip[Symbol.asyncIterator]());
  const ratio = () => checkRatio(r.out, size, lim, 'gzip');
  try {
    let headers = 0;
    let longName: string | undefined;
    let longLink: string | undefined;
    let pax: Record<string, string> = {};
    for (;;) {
      const h = await r.exact(512);
      ratio();
      if (h.every((v) => v === 0)) return; // end-of-archive marker; trailing data is not read
      if (++headers > lim.maxEntries * 2) throw new ArchiveError(`more than ${lim.maxEntries} entries`);
      if (!checksumOk(h)) throw new ArchiveError('tar header checksum mismatch');
      const type = String.fromCharCode(h[156]!);
      const size = octal(h, 124, 12, 'size');
      const padded = Math.ceil(size / 512) * 512;
      if (type === 'x' || type === 'g' || type === 'L' || type === 'K') {
        if (size > lim.maxPathBytes * 4 + 1024) throw new ArchiveError('tar extended header too large');
        const data = (await r.exact(padded)).subarray(0, size);
        if (type === 'x') pax = parsePax(data);
        else if (type === 'L') longName = field(data, 0, size);
        else if (type === 'K') longLink = field(data, 0, size);
        continue; // 'g' (global) records carry no path data we use
      }
      const prefix = h.toString('ascii', 257, 262) === 'ustar' ? field(h, 345, 155) : '';
      const name = pax.path ?? longName ?? (prefix ? `${prefix}/${field(h, 0, 100)}` : field(h, 0, 100));
      const link = pax.linkpath ?? longLink ?? field(h, 157, 100);
      const mode = octal(h, 100, 8, 'mode');
      if (pax.size !== undefined) throw new ArchiveError(`${name}: pax size records are not supported`);
      if ((type === '5' || type === '2') && size !== 0)
        throw new ArchiveError(`${name}: directory or symlink with data`);
      pax = {};
      longName = longLink = undefined;
      if (type === '0' || type === '\0' || type === '7') {
        if (size > lim.maxFileBytes) throw new ArchiveError(`${name}: file larger than ${lim.maxFileBytes} bytes`);
        const sink = await out.file(name, mode || 0o644);
        try {
          for (let left = size; left > 0;) {
            const b = await r.some(Math.min(left, CHUNK));
            if (!b) throw new ArchiveError('tar truncated');
            left -= b.length;
            ratio();
            await sink.write(b);
          }
        } catch (e) {
          await sink.abort();
          throw e;
        }
        await sink.close();
        await r.exact(padded - size);
      } else if (type === '5') {
        await out.dir(name);
      } else if (type === '2') {
        out.symlink(name, link);
      } else if (type === '1') throw new ArchiveError(`${name}: hard links are refused`);
      else if (type === '3' || type === '4' || type === '6')
        throw new ArchiveError(`${name}: device files and fifos are refused`);
      else throw new ArchiveError(`${name}: tar entry type ${JSON.stringify(type)} not supported`);
    }
  } finally {
    file.destroy();
    gunzip.destroy();
  }
}
