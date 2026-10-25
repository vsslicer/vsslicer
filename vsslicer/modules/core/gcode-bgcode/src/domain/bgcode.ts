// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Binary G-code container model: file header, block framing, enums, typed diagnostics.
 * Layout and enum values ported from libbgcode.
 * Ported from libbgcode@d4da907:src/LibBGCode/core/core.cpp, core.hpp (AGPL-3.0),
 * Copyright (c) Prusa Research (libbgcode, AGPL-3.0; no per-file notice upstream).
 * All integers are little-endian.
 */

/** `GCDE` */
export const MAGIC = [0x47, 0x43, 0x44, 0x45] as const;
/** Highest container version understood. */
export const VERSION = 1;
/** magic u32, version u32, checksum type u16 */
export const FILE_HEADER_SIZE = 10;

export const ChecksumType = { None: 0, Crc32: 1 } as const;
export type ChecksumType = (typeof ChecksumType)[keyof typeof ChecksumType];

export const BlockType = {
  FileMetadata: 0,
  GCode: 1,
  SlicerMetadata: 2,
  PrinterMetadata: 3,
  PrintMetadata: 4,
  Thumbnail: 5,
} as const;
export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export const Compression = { None: 0, Deflate: 1, Heatshrink11: 2, Heatshrink12: 3 } as const;
export type Compression = (typeof Compression)[keyof typeof Compression];

/** Metadata blocks: only INI. G-code blocks: none, MeatPack, MeatPack keeping comment lines. */
export const MetadataEncoding = { Ini: 0 } as const;
export const GCodeEncoding = { None: 0, MeatPack: 1, MeatPackComments: 2 } as const;
export const ThumbnailFormat = { Png: 0, Jpg: 1, Qoi: 2 } as const;

export interface FileHeader {
  version: number;
  checksumType: ChecksumType;
}

/** Parameters by block type; metadata and G-code blocks carry an encoding, thumbnails an image description. */
export type BlockParams =
  { type: 0 | 1 | 2 | 3 | 4; encoding: number } | { type: 5; format: number; width: number; height: number };

export interface Block {
  type: BlockType;
  compression: Compression;
  uncompressedSize: number;
  compressedSize: number;
  params: BlockParams;
  /** Payload after decompression; `undefined` when no codec could decode it (see the diagnostics). */
  data: Uint8Array | undefined;
  /** Byte offset of the block header in the file. */
  offset: number;
}

export type BgcodeDiagnosticCode =
  | 'bad-magic'
  | 'unsupported-version'
  | 'unknown-checksum-type'
  | 'unknown-block-type'
  | 'unknown-compression'
  | 'unsupported-compression'
  | 'unknown-encoding'
  | 'decode-failed'
  | 'size-mismatch'
  | 'crc-mismatch'
  | 'truncated';

/** A container problem; `offset` is the byte offset in the file where it starts. */
export interface BgcodeDiagnostic {
  code: BgcodeDiagnosticCode;
  severity: 'error' | 'warning';
  offset: number;
  message: string;
}

export const isBlockType = (v: number): v is BlockType => v >= 0 && v <= 5;
export const isCompression = (v: number): v is Compression => v >= 0 && v <= 3;
/** Size of the parameter bytes that follow the block header. */
export const paramsSize = (type: BlockType): number => (type === BlockType.Thumbnail ? 6 : 2);
