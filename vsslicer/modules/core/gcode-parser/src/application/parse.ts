// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Chunk, Parse, ParseOptions } from '@vsslicer/gcode-api';
import { GCodeParser } from '../domain/parser.ts';
import type { ParserOptions } from '../domain/parser.ts';

export type ParseSettings = ParseOptions & ParserOptions;

/**
 * Parses G-code text from `source` into chunks as the bytes arrive; only the chunk being built
 * and one partial line are held. Aborting rejects with the signal's reason.
 */
export const parse = async function* (
  source: AsyncIterable<Uint8Array>,
  opts: ParseSettings = {},
): AsyncGenerator<Chunk> {
  const parser = new GCodeParser(opts);
  const { signal } = opts;
  for await (const input of source) {
    signal?.throwIfAborted();
    for (const chunk of parser.feed(input)) {
      yield chunk;
      signal?.throwIfAborted();
    }
    if (parser.done) break;
  }
  signal?.throwIfAborted();
  yield* parser.end();
} satisfies Parse;
