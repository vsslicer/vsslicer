// SPDX-License-Identifier: AGPL-3.0-or-later
// Parse and plan one file: the work the preview's worker does. Pure Node/ES, no VS Code, no I/O of its own.
import type { Diagnostic, ParsedFile } from '@vsslicer/gcode-api';
import { bgcodeToGcode, decodeGcodeBlocks, readBgcode, type Codec } from '@vsslicer/gcode-bgcode';
import { collect, parse } from '@vsslicer/gcode-parser';
import { plannerFor, resolveLimits, runPlanner, type Timing } from '@vsslicer/gcode-planner';

export interface Loaded {
  parsed: ParsedFile;
  timing: Timing;
}

export interface LoadOptions {
  /** bgcode decompressors (Deflate, Heatshrink): adapters, passed in. */
  codecs: readonly Codec[];
  signal?: AbortSignal;
}

/** The decoded G-code text of a `.bgcode` stream; container problems go to `diagnostics`, at the text offset reached. */
async function* bgcodeText(
  bytes: AsyncIterable<Uint8Array>,
  codecs: readonly Codec[],
  diagnostics: Diagnostic[],
): AsyncGenerator<Uint8Array> {
  let at = 0;
  for await (const e of bgcodeToGcode(decodeGcodeBlocks(readBgcode(bytes, codecs)))) {
    if (e.kind === 'text') {
      at += e.text.byteLength;
      yield e.text;
    } else if (e.kind === 'diagnostic') {
      const d = e.diagnostic;
      diagnostics.push({ code: `bgcode-${d.code}`, severity: d.severity, fileOffset: at, message: d.message });
    }
  }
}

/**
 * Parses `bytes` (a `.gcode` file, or a `.bgcode` decoded to its text) and times it with the
 * planner of its flavour. Start times are written into the move buffers.
 */
export const loadPreview = async (
  kind: 'gcode' | 'bgcode',
  bytes: AsyncIterable<Uint8Array>,
  { codecs, signal }: LoadOptions,
): Promise<Loaded> => {
  const container: Diagnostic[] = [];
  const text = kind === 'bgcode' ? bgcodeText(bytes, codecs, container) : bytes;
  const parsed = await collect(parse(text, { signal }));
  for (const d of container) parsed.diagnostics.push(d);
  const limits = resolveLimits({ config: parsed.config });
  const timing = await runPlanner(plannerFor(parsed, limits), parsed, limits, {
    signal,
  });
  return { parsed, timing };
};
