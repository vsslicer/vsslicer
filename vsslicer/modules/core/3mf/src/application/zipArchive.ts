// SPDX-License-Identifier: AGPL-3.0-or-later
/** One central-directory record of a zip. */
export interface ZipEntry {
  readonly name: string;
  /** 0 stored, 8 deflate: the only methods 3MF uses. */
  readonly method: number;
  readonly crc32: number;
  /** Declared sizes, as the central directory states them. */
  readonly compressedSize: number;
  readonly size: number;
  /** Offset of the local header; the local record runs to the next entry's offset. */
  readonly localHeaderOffset: number;
}

/** The port the package reader needs from a zip: lazy per-entry access, nothing inflated until asked. */
export interface ZipArchive {
  readonly entries: readonly ZipEntry[];
  /** Still-compressed data of one entry, a view into the archive bytes (for byte-identical save). */
  raw(name: string): Uint8Array;
  /** Uncompressed content. Throws `SizeCapExceededError` before inflating if the declared size is over the cap. */
  inflated(name: string): Uint8Array;
}
