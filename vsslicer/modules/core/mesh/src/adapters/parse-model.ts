// SPDX-License-Identifier: AGPL-3.0-or-later
import { parseModelWith } from '../application/parse-model.ts';
import type { ParseModelOptions, ParseModelResult } from '../application/parse-model.ts';
import { parseObj } from './obj/obj.ts';
import { parseAsciiStl } from './stl/ascii-stl.ts';
import { isBinaryStl, parseBinaryStl } from './stl/binary-stl.ts';

const parsers = { isBinaryStl, parseBinaryStl, parseAsciiStl, parseObj };

/** `parseModelWith` over the built-in STL and OBJ parsers. */
export const parseModel = (bytes: Uint8Array, opts?: ParseModelOptions): Promise<ParseModelResult> =>
  parseModelWith(parsers, bytes, opts);
