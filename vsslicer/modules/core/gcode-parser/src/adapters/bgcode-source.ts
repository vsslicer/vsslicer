// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  bgcodeToGcode,
  decodeGcodeBlocks,
  deflateCodec,
  heatshrink11Codec,
  heatshrink12Codec,
  readBgcode,
} from '@vsslicer/gcode-bgcode';
import type { BgcodeDiagnostic, BgcodeMetadata } from '@vsslicer/gcode-bgcode';

export interface BgcodeSourceOptions {
  /** Called once at the end with every metadata block and the thumbnails. */
  onMetadata?: (metadata: BgcodeMetadata) => void;
  /** Called for each container problem (bad CRC, undecodable block, truncation); decoding goes on where it can. */
  onDiagnostic?: (diagnostic: BgcodeDiagnostic) => void;
}

const codecs = [deflateCodec, heatshrink11Codec, heatshrink12Codec];

/**
 * The text of a PrusaSlicer binary G-code (`.bgcode`) byte stream: its `.gcode` twin, as the byte
 * stream `parse` takes, so `parse(bgcodeSource(fileSource(path)))` gives what the twin gives.
 */
export async function* bgcodeSource(
  source: AsyncIterable<Uint8Array>,
  opts: BgcodeSourceOptions = {},
): AsyncGenerator<Uint8Array> {
  for await (const e of bgcodeToGcode(decodeGcodeBlocks(readBgcode(source, codecs)))) {
    if (e.kind === 'text') yield e.text;
    else if (e.kind === 'metadata') opts.onMetadata?.(e.metadata);
    else opts.onDiagnostic?.(e.diagnostic);
  }
}
