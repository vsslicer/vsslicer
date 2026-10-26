// SPDX-License-Identifier: AGPL-3.0-or-later
import { ThumbnailFormat } from './bgcode.ts';

/**
 * Text form of a .bgcode, as the `.gcode` twin shows it.
 * Ported from libbgcode@d4da907:src/LibBGCode/convert/convert.cpp from_binary_to_ascii (AGPL-3.0),
 * Copyright (c) Prusa Research.
 */

export type MetadataEntries = readonly (readonly [key: string, value: string])[];

export interface Thumbnail {
  format: number;
  width: number;
  height: number;
  data: Uint8Array;
}

/** All metadata of a file; a group is empty when its block is absent or could not be decoded. */
export interface BgcodeMetadata {
  file: MetadataEntries;
  printer: MetadataEntries;
  print: MetadataEntries;
  /** Legacy INI slicer config (`prusaslicer_config`). */
  slicer: MetadataEntries;
  /** Raw JSON text of the Slicer3 block (`prusaslicer_json_config`), when present. */
  slicerJson: string | undefined;
  thumbnails: readonly Thumbnail[];
}

const utf8 = new TextDecoder();

/** `key=value` lines, split on the first `=`; order and duplicates kept. */
export function parseIni(bytes: Uint8Array): MetadataEntries {
  const out: [string, string][] = [];
  for (const line of utf8.decode(bytes).split('\n')) {
    const i = line.indexOf('=');
    if (i >= 0) out.push([line.slice(0, i), line.slice(i + 1)]);
  }
  return out;
}

export const entriesText = (e: MetadataEntries): string => e.map(([k, v]) => `; ${k} = ${v}\n`).join('');

function base64(b: Uint8Array): string {
  return btoa(bytesToLatin1(b));
}

export function thumbnailText(t: Thumbnail): string {
  const name =
    t.format === ThumbnailFormat.Jpg
      ? 'thumbnail_JPG'
      : t.format === ThumbnailFormat.Qoi
        ? 'thumbnail_QOI'
        : 'thumbnail';
  let enc = base64(t.data);
  let out = `\n;\n; ${name} begin ${t.width}x${t.height} ${enc.length}\n`;
  for (; enc.length > 78; enc = enc.slice(78)) out += `; ${enc.slice(0, 78)}\n`;
  if (enc) out += `; ${enc}\n`;
  return out + `; ${name} end\n;\n`;
}

/** Drops lines that are blank or only `;` (libbgcode's remove_empty_lines); input is latin1 text. */
export function dropBlankLines(text: string): string {
  let out = '';
  const lines = text.split('\n');
  if (text.endsWith('\n')) lines.pop();
  for (const line of lines)
    if (
      line
        .replace(/^[ \t]+/, '')
        .replace(/^;/, '')
        .trim() !== ''
    )
      out += line + '\n';
  return out;
}

/** Lossless bytes <-> string (one char per byte); `TextDecoder('latin1')` is windows-1252 and not lossless. Buffer runs in Node and the desktop extension host. */
export const bytesToLatin1 = (b: Uint8Array): string =>
  Buffer.from(b.buffer, b.byteOffset, b.length).toString('latin1');
/** Own ArrayBuffer sized exactly to the text (Buffer.from pools small strings, so its `.buffer` would be 8 KiB). */
export const latin1ToBytes = (s: string): Uint8Array => {
  const b = Buffer.allocUnsafeSlow(s.length);
  b.write(s, 'latin1');
  return b;
};
