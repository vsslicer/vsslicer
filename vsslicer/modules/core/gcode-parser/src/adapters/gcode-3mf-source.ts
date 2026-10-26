// SPDX-License-Identifier: AGPL-3.0-or-later
import { openZip } from '@vsslicer/3mf';

const CHUNK = 64 * 1024;

/** Names of the `.gcode` entries of a `.gcode.3mf` (BBL: `Metadata/plate_N.gcode`), in archive order. */
export function gcode3mfEntries(archive: Uint8Array): string[] {
  return openZip(archive)
    .entries.map((e) => e.name)
    .filter((n) => n.endsWith('.gcode'));
}

/**
 * The text of one G-code entry of a `.gcode.3mf` as the byte stream `parse` takes.
 * A truncated or malformed zip, a missing entry, or an entry over `maxEntryBytes` (default 512 MiB)
 * throws the typed `@vsslicer/3mf` error (`CorruptZipError`, `SizeCapExceededError`) on the first pull.
 * shortcut: @vsslicer/3mf 0.1.0 reads from a whole in-memory archive and inflates an entry into one buffer
 * (no entry stream, no file-backed reader), so peak memory is archive + entry; switch when 3mf grows a streaming entry reader.
 * Stored/deflated, data descriptors and zip64 come from 3mf, which trusts the central directory.
 */
export async function* gcode3mfSource(
  archive: Uint8Array,
  entry: string,
  opts: { maxEntryBytes?: number } = {},
): AsyncGenerator<Uint8Array> {
  const text = openZip(archive, opts).inflated(entry);
  for (let i = 0; i < text.length; i += CHUNK) yield text.subarray(i, i + CHUNK);
}
