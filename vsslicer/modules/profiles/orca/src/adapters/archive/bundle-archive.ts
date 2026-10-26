// SPDX-License-Identifier: AGPL-3.0-or-later
// Orca/Bambu preset bundles (`.orca_printer`, `.orca_filament`, `.bbscfg`, `.bbsflmt`): a zip holding
// `bundle_structure.json` and `printer/`, `filament/`, `process/` JSON presets. Layout from OrcaSlicer@09aa0114b4e1:
//   src/slic3r/GUI/ExportPresetBundleDialog.cpp:374-463 (writer: entry names, manifest written last)
//   src/libslic3r/PresetBundle.cpp:2410-2500 (reader: manifest first, then every entry; containment checks)
// Only the format is re-implemented; no Orca code is copied. A bundle is untrusted input (rule 25).
import { buildBundleStructure, parseBundleStructure, type BundleStructure } from '@vsslicer/profile-api';
import { Inflate, zipSync, type Zippable } from 'fflate';

/** Most entries (directories included) one archive may hold; real bundles hold dozens. */
export const MAX_BUNDLE_ENTRIES = 1024;
/** Most uncompressed bytes in one entry (bed textures and models included). */
export const MAX_BUNDLE_ENTRY_BYTES = 8 * 1024 * 1024;
/** Most uncompressed bytes over all entries. */
export const MAX_BUNDLE_TOTAL_BYTES = 32 * 1024 * 1024;
/** Highest uncompressed:compressed ratio for an entry over {@link RATIO_FLOOR_BYTES}; preset JSON packs about 10:1. */
export const MAX_COMPRESSION_RATIO = 100;
/** Entries smaller than this skip the ratio check: tiny files compress oddly and cannot hurt. */
export const RATIO_FLOOR_BYTES = 64 * 1024;
/** Longest entry name, as the manifest allows (`BUNDLE_LIMITS.maxPathLength`). */
export const MAX_ENTRY_NAME_LENGTH = 512;

export const BUNDLE_STRUCTURE_NAME = 'bundle_structure.json';

export class BundleArchiveError extends Error {
  override name = 'BundleArchiveError';
}

export interface BundleArchive {
  /** Absent for bundles exported without one; Orca then imports the presets as plain user presets. */
  manifest?: BundleStructure;
  /** File entries by name, inflated in memory; directory entries and the manifest are not included. */
  entries: Map<string, Uint8Array>;
}

const INPUT_SLICE = 64 * 1024;
const utf8 = new TextDecoder('utf-8', { fatal: true });
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
/** CRC-32 (IEEE), as zip stores it. */
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
/** Names collide on case-insensitive and normalising file systems (APFS, NTFS) when this key matches. */
const nameKey = (name: string): string => name.normalize('NFC').toLowerCase();
const fail = (why: string): never => {
  throw new BundleArchiveError(why);
};

/** The reason a name is unsafe, or undefined. Relative, `/`-separated, no empty, `.` or `..` segment (also as Windows trims them). */
export function unsafeEntryName(name: string): string | undefined {
  if (name.length === 0) return 'empty name';
  if (name.length > MAX_ENTRY_NAME_LENGTH) return `name longer than ${MAX_ENTRY_NAME_LENGTH}`;
  if (name.includes('\0')) return 'NUL in name';
  if (name.includes('\\')) return 'backslash in name';
  if (name.startsWith('/')) return 'absolute path';
  if (name.charCodeAt(1) === 0x3a) return 'drive-letter path';
  if (name.includes(':')) return 'colon in name (NTFS alternate stream)';
  if (name.split('/').some((s) => /^[. ]*$/.test(s))) return 'empty, "." or ".." segment'; // single-class star: linear
  if (name.split('/').some((s) => /[. ]$/.test(s))) return 'segment ends in "." or space (Windows trims it)';
  return undefined;
}

/** Reads a bundle into memory, refusing anything unsafe before inflating a byte. Nothing touches disk. */
export function readBundleArchive(data: Uint8Array): BundleArchive {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const need = (at: number, len: number): void => {
    if (at < 0 || at + len > data.length) fail('corrupt archive: record outside the file');
  };
  const u16 = (at: number): number => (need(at, 2), view.getUint16(at, true));
  const u32 = (at: number): number => (need(at, 4), view.getUint32(at, true));

  let eocd = -1;
  for (let i = data.length - 22; i >= Math.max(0, data.length - 22 - 0xffff); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) fail('not a zip archive: no end of central directory');
  // The record must end the file: a fake record inside the comment or bytes after it are refused.
  if (eocd + 22 + u16(eocd + 20) !== data.length)
    fail('corrupt archive: end of central directory does not end the file');
  const count = u16(eocd + 10);
  const cdOffset = u32(eocd + 16);
  // shortcut: ZIP64 is refused, bundles are far below 4 GiB; add it if an exporter ever emits it for small files.
  if (count === 0xffff || cdOffset === 0xffffffff) fail('ZIP64 archives are not supported');
  if (count > MAX_BUNDLE_ENTRIES) fail(`archive has ${count} entries, over the limit of ${MAX_BUNDLE_ENTRIES}`);

  interface Entry {
    name: string;
    dir: boolean;
    method: number;
    compressedSize: number;
    size: number;
    crc: number;
    start: number;
  }
  const entries: Entry[] = [];
  const seen = new Set<string>();
  let total = 0;
  for (let n = 0, p = cdOffset; n < count; n++) {
    if (u32(p) !== 0x02014b50) fail('corrupt archive: bad central directory record');
    const flags = u16(p + 8);
    const method = u16(p + 10);
    const crc = u32(p + 16);
    const compressedSize = u32(p + 20);
    const size = u32(p + 24);
    const nameLen = u16(p + 28);
    const extraLen = u16(p + 30);
    const commentLen = u16(p + 32);
    const attrs = u32(p + 38);
    const localOffset = u32(p + 42);
    need(p + 46, nameLen);
    let name = '';
    try {
      name = utf8.decode(data.subarray(p + 46, p + 46 + nameLen));
    } catch {
      fail(`entry ${n} has a name that is not UTF-8`);
    }
    const shown = JSON.stringify(name.slice(0, 80));
    const dir = name.endsWith('/');
    const why = unsafeEntryName(dir ? name.slice(0, -1) : name);
    if (why) fail(`unsafe entry ${shown}: ${why}`);
    // Unix modes sit in the high 16 bits; S_IFLNK is 0o120000.
    if (((attrs >>> 16) & 0o170000) === 0o120000) fail(`unsafe entry ${shown}: symbolic link`);
    if (flags & 1) fail(`entry ${shown} is encrypted`);
    if (!dir && method !== 0 && method !== 8) fail(`entry ${shown} uses unsupported compression method ${method}`);
    // Case-folded so the names stay distinct on case-insensitive file systems too.
    const key = nameKey(name);
    if (seen.has(key)) fail(`duplicate entry ${shown}`);
    seen.add(key);
    if (size > MAX_BUNDLE_ENTRY_BYTES)
      fail(`entry ${shown} declares ${size} bytes, over the limit of ${MAX_BUNDLE_ENTRY_BYTES}`);
    if (size > RATIO_FLOOR_BYTES && size > compressedSize * MAX_COMPRESSION_RATIO) {
      fail(`entry ${shown} compresses more than ${MAX_COMPRESSION_RATIO}:1, refused as a zip bomb`);
    }
    total += size;
    if (total > MAX_BUNDLE_TOTAL_BYTES) fail(`entries declare more than ${MAX_BUNDLE_TOTAL_BYTES} bytes in total`);
    if (u32(localOffset) !== 0x04034b50) fail(`corrupt archive: bad local header for ${shown}`);
    // shortcut: the local header's own name and sizes are not compared with the central directory, which alone is used.
    const start = localOffset + 30 + u16(localOffset + 26) + u16(localOffset + 28);
    need(start, compressedSize);
    entries.push({ name, dir, method, compressedSize, size, crc, start });
    p += 46 + nameLen + extraLen + commentLen;
  }

  // Overlapping data ranges let a small archive inflate the same bytes many times over.
  const byStart = [...entries].sort((a, b) => a.start - b.start);
  for (let i = 1; i < byStart.length; i++) {
    const prev = byStart[i - 1]!;
    if (byStart[i]!.start < prev.start + prev.compressedSize) fail(`entries overlap at ${JSON.stringify(prev.name)}`);
  }

  const out = new Map<string, Uint8Array>();
  for (const e of entries)
    if (!e.dir) {
      const bytes = inflate(data.subarray(e.start, e.start + e.compressedSize), e);
      if (crc32(bytes) !== e.crc) fail(`entry ${JSON.stringify(e.name.slice(0, 80))} is damaged: CRC-32 mismatch`);
      out.set(e.name, bytes);
    }

  const manifestBytes = out.get(BUNDLE_STRUCTURE_NAME);
  if (!manifestBytes) return { entries: out };
  out.delete(BUNDLE_STRUCTURE_NAME);
  let text = '';
  try {
    text = utf8.decode(manifestBytes);
  } catch {
    fail(`${BUNDLE_STRUCTURE_NAME} is not UTF-8`);
  }
  const parsed = parseBundleStructure(text, new Set(out.keys()));
  if (!parsed.ok) return fail(`${BUNDLE_STRUCTURE_NAME}: ${parsed.error.message}`);
  return { manifest: parsed.bundle, entries: out };
}

/** Inflates one entry, stopping as soon as the output passes its declared size (the declared size was capped above). */
function inflate(packed: Uint8Array, e: { name: string; method: number; size: number }): Uint8Array {
  const shown = JSON.stringify(e.name.slice(0, 80));
  if (e.method === 0) {
    if (packed.length !== e.size) fail(`entry ${shown}: stored size does not match its declared size`);
    return packed.slice();
  }
  const out = new Uint8Array(e.size);
  let at = 0;
  try {
    const stream = new Inflate((chunk) => {
      if (at + chunk.length > e.size) fail(`entry ${shown} inflates past its declared size, refused as a zip bomb`);
      out.set(chunk, at);
      at += chunk.length;
    });
    // Small slices bound one push's output (deflate expands at most ~1032x), so the check fires before memory grows.
    for (let i = 0; i < packed.length; i += INPUT_SLICE) {
      stream.push(packed.subarray(i, i + INPUT_SLICE), i + INPUT_SLICE >= packed.length);
    }
    if (packed.length === 0) stream.push(packed, true);
  } catch (cause) {
    if (cause instanceof BundleArchiveError) throw cause;
    fail(`entry ${shown} is not valid deflate data`);
  }
  if (at !== e.size) fail(`entry ${shown} inflates short of its declared size`);
  return out;
}

export interface BundlePreset {
  /** The file name inside its folder, e.g. `My Printer.json`; one safe path segment. */
  fileName: string;
  data: Uint8Array;
}

export interface BundleWriteInput {
  /** Used for the offline bundle id (`buildBundleStructure`). */
  name: string;
  /** Export time as Orca formats it; passed in so the output is deterministic. */
  clock: string;
  printer?: BundlePreset[];
  filament?: BundlePreset[];
  process?: BundlePreset[];
}

// Local-time components, because zip DOS times are local: the same bytes in every time zone.
const FIXED_MTIME = new Date(1980, 0, 1, 0, 0, 0);

/** Writes a bundle as Orca does (`<kind>/<file>` entries, then the manifest). Same input, same bytes. Unsafe names throw. */
export function writeBundleArchive(input: BundleWriteInput): Uint8Array {
  const files: Zippable = {};
  const lists: Record<'printer' | 'filament' | 'process', string[]> = { printer: [], filament: [], process: [] };
  const taken = new Set<string>();
  let count = 1;
  let total = 0;
  for (const kind of ['printer', 'filament', 'process'] as const) {
    for (const preset of input[kind] ?? []) {
      const why =
        unsafeEntryName(preset.fileName) ?? (preset.fileName.includes('/') ? 'more than one segment' : undefined);
      if (why) fail(`unsafe preset file name ${JSON.stringify(preset.fileName.slice(0, 80))}: ${why}`);
      const name = `${kind}/${preset.fileName}`;
      if (taken.has(nameKey(name))) fail(`duplicate preset ${JSON.stringify(name)}`);
      taken.add(nameKey(name));
      if (++count > MAX_BUNDLE_ENTRIES) fail(`more than ${MAX_BUNDLE_ENTRIES} entries`);
      if (preset.data.length > MAX_BUNDLE_ENTRY_BYTES)
        fail(`preset ${JSON.stringify(name)} is over ${MAX_BUNDLE_ENTRY_BYTES} bytes`);
      total += preset.data.length;
      if (total > MAX_BUNDLE_TOTAL_BYTES) fail(`presets are over ${MAX_BUNDLE_TOTAL_BYTES} bytes in total`);
      files[name] = [preset.data, { mtime: FIXED_MTIME }];
      lists[kind].push(name);
    }
  }
  const manifest = buildBundleStructure({
    name: input.name,
    clock: input.clock,
    printerConfig: lists.printer,
    filamentConfig: lists.filament,
    processConfig: lists.process,
  });
  files[BUNDLE_STRUCTURE_NAME] = [new TextEncoder().encode(JSON.stringify(manifest)), { mtime: FIXED_MTIME }];
  return zipSync(files, { level: 6 });
}
