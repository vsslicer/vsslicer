// SPDX-License-Identifier: AGPL-3.0-or-later
import { open } from 'node:fs/promises';
import type { JobSummary } from '@vsslicer/gcode-api';
import { readSummary } from '../application/read-summary.ts';

/** How much of the start and the end of a file is read: slicers write their summary there. */
const REGION = 512 * 1024;

/**
 * `readSummary` for a file path: reads the first and last 512 KiB (the whole file if it is
 * smaller), cut to whole lines. shortcut: a summary comment in the middle of a larger file is not
 * seen; use `readSummary(fileSource(path))` to scan all of it.
 */
export async function readSummaryFile(path: string): Promise<JobSummary> {
  const file = await open(path, 'r');
  try {
    const { size } = await file.stat();
    const read = async (position: number, length: number): Promise<Uint8Array> => {
      const buf = new Uint8Array(length);
      const { bytesRead } = await file.read(buf, 0, length, position);
      return buf.subarray(0, bytesRead);
    };
    if (size <= 2 * REGION) return await readSummary(oneOf(await read(0, size)));
    const head = await read(0, REGION);
    const tail = await read(size - REGION, REGION);
    // cut both at line breaks so the seam cannot join two half lines
    const parts = [head.subarray(0, head.lastIndexOf(0x0a) + 1), tail.subarray(tail.indexOf(0x0a) + 1)];
    return await readSummary(oneOf(...parts));
  } finally {
    await file.close();
  }
}

async function* oneOf(...parts: Uint8Array[]): AsyncGenerator<Uint8Array> {
  yield* parts;
}
