// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole, STATE_CHANGE_STRIDE } from '@vsslicer/gcode-api';
import type { Chunk } from '@vsslicer/gcode-api';
import type { BgcodeMetadata } from '@vsslicer/gcode-bgcode';
import { bgcodeSource } from '../../src/adapters/bgcode-source.ts';
import { readSummary } from '../../src/application/read-summary.ts';
import { GCodeParser } from '../../src/domain/parser.ts';
import type { Summariser, Summary } from './golden.ts';
import { pieces } from './run.ts';

const roleName = new Map<number, string>(Object.entries(MoveRole).map(([name, v]) => [v, name]));
const NOT_EXTRUSION = MoveFlag.Travel | MoveFlag.Retract | MoveFlag.Unretract;

/** Extruding moves per role name, in role order. The chords of one arc count as one move. */
export function roleHistogram(chunks: readonly Chunk[]): Record<string, number> {
  const counts = new Map<number, number>();
  let arcAt = -1; // file offset of the arc whose chords were just counted
  for (const c of chunks) {
    const v = new DataView(c.moves);
    for (let i = 0; i < c.moveCount; i++) {
      const flags = v.getUint8(i * MOVE_STRIDE + MoveOffset.flags);
      if ((flags & NOT_EXTRUSION) !== 0) continue;
      if ((flags & MoveFlag.Arc) !== 0) {
        const at = v.getUint32(i * MOVE_STRIDE + MoveOffset.fileOffset, true);
        if (at === arcAt) continue;
        arcAt = at;
      }
      const role = v.getUint8(i * MOVE_STRIDE + MoveOffset.role);
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }
  return Object.fromEntries([...counts].sort((a, b) => a[0] - b[0]).map(([role, n]) => [roleName.get(role), n]));
}

/** G2/G3 commands (runs of Arc moves with one file offset) and the moves they became. */
export function arcSummary(chunks: readonly Chunk[]): { commands: number; segments: number } {
  let commands = 0;
  let segments = 0;
  let arcAt = -1;
  for (const c of chunks) {
    const v = new DataView(c.moves);
    for (let i = 0; i < c.moveCount; i++) {
      if ((v.getUint8(i * MOVE_STRIDE + MoveOffset.flags) & MoveFlag.Arc) === 0) continue;
      segments++;
      const at = v.getUint32(i * MOVE_STRIDE + MoveOffset.fileOffset, true);
      if (at !== arcAt) commands++;
      arcAt = at;
    }
  }
  return { commands, segments };
}

const sha256 = (data: string | Uint8Array): string => createHash('sha256').update(data).digest('hex');
/** Config keys shown by name in the golden, besides the count and the hash of the whole sorted map. */
const SAMPLE_KEYS = ['layer_height', 'nozzle_diameter', 'filament_type', 'printer_model', 'gcode_flavor'];

/** Thumbnails, object labels and the config block of a parse, as the golden JSON records them. */
export function metadataSummary(chunks: readonly Chunk[]): Summary {
  const objects = new Map<string, { name: string; id?: string; copy?: number; ranges: number; moves: number }>();
  for (const o of chunks.flatMap((c) => c.objects)) {
    const key = JSON.stringify([o.name, o.id, o.copy]);
    const entry = objects.get(key) ?? {
      name: o.name,
      ...(o.id && { id: o.id }),
      ...(o.copy !== undefined && { copy: o.copy }),
      ranges: 0,
      moves: 0,
    };
    entry.ranges += o.ranges.length;
    entry.moves += o.ranges.reduce((n, r) => n + r.endMove - r.firstMove, 0);
    objects.set(key, entry);
  }
  const config = Object.fromEntries(
    Object.entries(Object.assign({}, ...chunks.map((c) => c.config)) as Record<string, string>).sort(([a], [b]) =>
      a < b ? -1 : 1,
    ),
  );
  return {
    thumbnails: chunks
      .flatMap((c) => c.thumbnails)
      .map((t) => ({
        format: t.format,
        width: t.width,
        height: t.height,
        bytes: t.data.length,
        sha256: sha256(t.data),
      })),
    objects: [...objects.values()],
    config: {
      keys: Object.keys(config).length,
      sha256: sha256(JSON.stringify(config)),
      sample: Object.fromEntries(SAMPLE_KEYS.filter((k) => k in config).map((k) => [k, config[k]])),
    },
  };
}

/** Every bgcode metadata block: the small ones in full, the slicer config as count, hash and a few keys. */
export function bgcodeSummary(m: BgcodeMetadata): Summary {
  const slicer = Object.fromEntries(m.slicer);
  return {
    file: m.file,
    printer: m.printer,
    print: m.print,
    slicer: {
      keys: m.slicer.length,
      sha256: sha256(JSON.stringify(m.slicer)),
      sample: Object.fromEntries(SAMPLE_KEYS.filter((k) => k in slicer).map((k) => [k, slicer[k]])),
    },
    slicerJson: m.slicerJson === undefined ? null : { bytes: m.slicerJson.length, sha256: sha256(m.slicerJson) },
    thumbnails: m.thumbnails.map((t) => ({
      format: t.format,
      width: t.width,
      height: t.height,
      bytes: t.data.length,
      sha256: sha256(t.data),
    })),
  };
}

/** Parses `bytes` in 64 KiB pieces; returns the chunks and the parser (for what it detected). */
export async function parseAll(
  bytes: Uint8Array,
  source: (s: AsyncIterable<Uint8Array>) => AsyncIterable<Uint8Array> = (s) => s,
): Promise<{ chunks: Chunk[]; parser: GCodeParser }> {
  const parser = new GCodeParser();
  const chunks: Chunk[] = [];
  for await (const piece of source(pieces(bytes, 64 * 1024))) chunks.push(...parser.feed(piece));
  chunks.push(...parser.end());
  return { chunks, parser };
}

/**
 * Golden fields from the real parser: move, state-change and marker counts, the diagnostic codes,
 * the detected slicer and flavour, the layer count and the extruding moves per role. Thumbnails (format,
 * size, hash of the bytes), object labels (ranges and moves) and the config block (key count, hash of
 * the sorted map, a few keys). A .bgcode is decoded to its text and gets the same fields plus a
 * `bgcode` entry with every metadata block. A .gcode.3mf only carries the byte size and hash:
 * its text is decoded by its container card. `summary` is `readSummary`'s result (the slicer's own job statistics).
 */
export const parserSummary: Summariser = async (bytes, file) => {
  if (file.format !== 'gcode' && file.format !== 'bgcode') return {};
  let meta: BgcodeMetadata | undefined;
  const text = (s: AsyncIterable<Uint8Array>): AsyncIterable<Uint8Array> =>
    file.format === 'bgcode' ? bgcodeSource(s, { onMetadata: (m) => (meta = m) }) : s;
  const { chunks, parser } = await parseAll(bytes, text);
  return {
    ...(meta && { bgcode: bgcodeSummary(meta) }),
    slicer: parser.slicer,
    flavour: parser.flavour,
    moveCount: chunks.reduce((n, c) => n + c.moveCount, 0),
    stateChanges: chunks.reduce((n, c) => n + c.stateChanges.byteLength / STATE_CHANGE_STRIDE, 0),
    markers: chunks.reduce((n, c) => n + c.markers.length, 0),
    layerCount: chunks.reduce((n, c) => n + c.layers.length, 0),
    arcs: arcSummary(chunks),
    roleHistogram: roleHistogram(chunks),
    diagnostics: chunks.flatMap((c) => c.diagnostics.map((d) => d.code)),
    ...metadataSummary(chunks),
    summary: await readSummary(text(pieces(bytes, 64 * 1024))),
  };
};
