// SPDX-License-Identifier: AGPL-3.0-or-later
import { BlockType, GCodeEncoding, type Block } from '../domain/bgcode.ts';
import { meatpackDecode } from '../domain/meatpack.ts';
import type { BgcodeEvent } from './read-bgcode.ts';

export type GcodeEvent = BgcodeEvent | { kind: 'gcode'; block: Block; text: Uint8Array };

/**
 * Adds decoded G-code to a `readBgcode` event stream: every G-code block whose payload could be
 * decompressed is followed by `{ kind: 'gcode', text }` (the block's G-code as bytes, MeatPack undone;
 * concatenate the `text` of consecutive events for the whole program). A MeatPack stream that fails to
 * decode yields a `decode-failed` diagnostic at the block's offset and no `gcode` event for it.
 */
export async function* decodeGcodeBlocks(events: AsyncIterable<BgcodeEvent>): AsyncGenerator<GcodeEvent> {
  for await (const e of events) {
    yield e;
    if (
      e.kind !== 'block' ||
      e.block.type !== BlockType.GCode ||
      !e.block.data ||
      e.block.params.type === BlockType.Thumbnail
    )
      continue;
    const { encoding } = e.block.params;
    if (encoding === GCodeEncoding.None) yield { kind: 'gcode', block: e.block, text: e.block.data };
    else if (encoding === GCodeEncoding.MeatPack || encoding === GCodeEncoding.MeatPackComments)
      try {
        yield { kind: 'gcode', block: e.block, text: meatpackDecode(e.block.data) };
      } catch (err) {
        yield {
          kind: 'diagnostic',
          diagnostic: {
            code: 'decode-failed',
            severity: 'error',
            offset: e.block.offset,
            message: `MeatPack: ${err instanceof Error ? err.message : String(err)}`,
          },
        };
      }
  }
}
