// SPDX-License-Identifier: AGPL-3.0-or-later
// Parse and plan one file: the work the preview's worker does. Pure Node/ES, no VS Code, no I/O of its own.
import type { Diagnostic, ParsedFile } from '@vsslicer/gcode-api';
import { bgcodeSource, collect, parse } from '@vsslicer/gcode-parser';
import { plannerFor, resolveLimits, runPlanner, type Timing } from '@vsslicer/gcode-planner';

export interface Loaded {
  parsed: ParsedFile;
  timing: Timing;
}

export interface LoadOptions {
  signal?: AbortSignal;
}

/**
 * Parses `bytes` (a `.gcode` file, or a `.bgcode` decoded to its text) and times it with the
 * planner of its flavour. Start times are written into the move buffers.
 */
export const loadPreview = async (
  kind: 'gcode' | 'bgcode',
  bytes: AsyncIterable<Uint8Array>,
  { signal }: LoadOptions = {},
): Promise<Loaded> => {
  const container: Diagnostic[] = [];
  // container problems are reported at the decoded-text offset reached
  const text =
    kind === 'bgcode'
      ? bgcodeSource(bytes, {
          onDiagnostic: (d, at) =>
            container.push({ code: `bgcode-${d.code}`, severity: d.severity, fileOffset: at, message: d.message }),
        })
      : bytes;
  const parsed = await collect(parse(text, { signal }));
  for (const d of container) parsed.diagnostics.push(d);
  const limits = resolveLimits({ flavour: parsed.flavourName, config: parsed.config });
  const timing = await runPlanner(plannerFor(parsed, limits), parsed, limits, {
    signal,
  });
  return { parsed, timing };
};
