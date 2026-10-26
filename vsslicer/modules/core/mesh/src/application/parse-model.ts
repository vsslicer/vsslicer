// SPDX-License-Identifier: AGPL-3.0-or-later
import { FileTooLargeError, TooManyTrianglesError } from '../domain/errors.ts';
import type { IndexedMesh } from '../domain/indexed-mesh.ts';
import type { MeshStats } from '../domain/mesh-stats.ts';
import { computeStats } from '../domain/stats/compute-stats.ts';

type Chunks = Iterable<Uint8Array>;
/** Port: the format parsers and the binary-STL test, supplied by the adapters layer. */
export interface MeshParsers {
  isBinaryStl(head: Uint8Array, totalBytes: number): boolean;
  parseBinaryStl(chunks: Chunks): Promise<IndexedMesh>;
  parseAsciiStl(chunks: Chunks): Promise<IndexedMesh>;
  parseObj(chunks: Chunks): Promise<IndexedMesh>;
}

/** Above this many triangles the caller must confirm. Placeholder until the VWR-37 benchmark sets it. */
export const DEFAULT_SOFT_TRIANGLE_CAP = 1_000_000;
/** Above this many triangles the model is refused, confirmed or not. */
export const DEFAULT_HARD_TRIANGLE_CAP = 10_000_000;
/** Files above this size are refused before any parsing. */
export const DEFAULT_MAX_FILE_BYTES = 1024 * 1024 * 1024;

export interface ParseModelOptions {
  /** File extension with or without the dot (`stl`, `.obj`); unknown or missing means sniff the bytes. */
  readonly extension?: string;
  readonly softTriangleCap?: number;
  readonly hardTriangleCap?: number;
  readonly maxFileBytes?: number;
  /** The user accepted a model above the soft cap. */
  readonly confirmed?: boolean;
}

export type ParseModelResult =
  | { readonly kind: 'parsed'; readonly mesh: IndexedMesh; readonly stats: MeshStats }
  | { readonly kind: 'confirm-needed'; readonly triangleCount: number; readonly softCap: number };

function isObj({ isBinaryStl }: MeshParsers, bytes: Uint8Array, extension: string | undefined): boolean {
  const ext = extension?.toLowerCase().replace(/^\./, '');
  if (ext === 'obj') return true;
  if (ext === 'stl') return false;
  if (isBinaryStl(bytes, bytes.length)) return false;
  // unknown: OBJ only when it opens like OBJ text; anything else goes to the STL path, which reports damage
  return /^\s*(#|mtllib|usemtl|[vofgs]\s)/.test(new TextDecoder().decode(bytes.subarray(0, 64)));
}

/**
 * Parse STL (binary or ASCII) or OBJ bytes into a welded mesh and its stats.
 * Throws `FileTooLargeError` and `TooManyTrianglesError` for the hard limits, plus the parsers' errors.
 * A binary STL is checked from its header before parsing; other formats after.
 */
export async function parseModelWith(
  parsers: MeshParsers,
  bytes: Uint8Array,
  opts: ParseModelOptions = {},
): Promise<ParseModelResult> {
  const { softTriangleCap = DEFAULT_SOFT_TRIANGLE_CAP, hardTriangleCap = DEFAULT_HARD_TRIANGLE_CAP } = opts;
  const { maxFileBytes = DEFAULT_MAX_FILE_BYTES, confirmed = false } = opts;
  if (bytes.length > maxFileBytes) throw new FileTooLargeError(bytes.length, maxFileBytes);

  const check = (triangles: number): ParseModelResult | undefined => {
    if (triangles > hardTriangleCap) throw new TooManyTrianglesError(triangles, hardTriangleCap);
    if (triangles > softTriangleCap && !confirmed)
      return { kind: 'confirm-needed', triangleCount: triangles, softCap: softTriangleCap };
    return undefined;
  };

  let mesh: IndexedMesh;
  if (isObj(parsers, bytes, opts.extension)) {
    mesh = await parsers.parseObj([bytes]);
  } else if (parsers.isBinaryStl(bytes, bytes.length)) {
    const early = check(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(80, true));
    if (early) return early;
    mesh = await parsers.parseBinaryStl([bytes]);
  } else if (/^\s*solid/i.test(new TextDecoder().decode(bytes.subarray(0, 64)))) {
    mesh = await parsers.parseAsciiStl([bytes]);
  } else {
    mesh = await parsers.parseBinaryStl([bytes]); // not text: names the damage (cut short, wrong count)
  }
  const triangleCount = mesh.indices.length / 3;
  const late = check(triangleCount);
  if (late) return late;
  return { kind: 'parsed', mesh, stats: computeStats(mesh) };
}
