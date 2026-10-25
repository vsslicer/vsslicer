// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from 'node:crypto';
import { MOVE_STRIDE, MoveFlag, MoveOffset, MoveRole, STATE_CHANGE_STRIDE } from '@vsslicer/gcode-api';
import type { Chunk } from '@vsslicer/gcode-api';
import { GCodeParser } from '../../src/domain/parser.ts';
import type { Summariser, Summary } from './golden.ts';
import { pieces } from './run.ts';

const roleName = new Map<number, string>(Object.entries(MoveRole).map(([name, v]) => [v, name]));
const NOT_EXTRUSION = MoveFlag.Travel | MoveFlag.Retract | MoveFlag.Unretract;

/** Extruding moves per role name (an arc counts as one), in role order. */
export function roleHistogram(chunks: readonly Chunk[]): Record<string, number> {
  const counts = new Map<number, number>();
  for (const c of chunks) {
    const v = new DataView(c.moves);
    for (let i = 0; i < c.moveCount; i++) {
      if ((v.getUint8(i * MOVE_STRIDE + MoveOffset.flags) & NOT_EXTRUSION) !== 0) continue;
      const role = v.getUint8(i * MOVE_STRIDE + MoveOffset.role);
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }
  return Object.fromEntries([...counts].sort((a, b) => a[0] - b[0]).map(([role, n]) => [roleName.get(role), n]));
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

/** Parses `bytes` in 64 KiB pieces; returns the chunks and the parser (for what it detected). */
export async function parseAll(bytes: Uint8Array): Promise<{ chunks: Chunk[]; parser: GCodeParser }> {
  const parser = new GCodeParser();
  const chunks: Chunk[] = [];
  for await (const piece of pieces(bytes, 64 * 1024)) chunks.push(...parser.feed(piece));
  chunks.push(...parser.end());
  return { chunks, parser };
}

/**
 * Golden fields from the real parser: move, state-change and marker counts, the diagnostic codes,
 * the detected slicer and flavour, the layer count and the extruding moves per role. Thumbnails (format,
 * size, hash of the bytes), object labels (ranges and moves) and the config block (key count, hash of
 * the sorted map, a few keys). Binary files (.bgcode, .gcode.3mf) only carry the byte size and hash:
 * their text is decoded by the container cards. GCP-8 adds the summary here.
 */
export const parserSummary: Summariser = async (bytes, file) => {
  if (file.format !== 'gcode') return {};
  const { chunks, parser } = await parseAll(bytes);
  return {
    slicer: parser.slicer,
    flavour: parser.flavour,
    moveCount: chunks.reduce((n, c) => n + c.moveCount, 0),
    stateChanges: chunks.reduce((n, c) => n + c.stateChanges.byteLength / STATE_CHANGE_STRIDE, 0),
    markers: chunks.reduce((n, c) => n + c.markers.length, 0),
    layerCount: chunks.reduce((n, c) => n + c.layers.length, 0),
    roleHistogram: roleHistogram(chunks),
    diagnostics: chunks.flatMap((c) => c.diagnostics.map((d) => d.code)),
    ...metadataSummary(chunks),
  };
};
