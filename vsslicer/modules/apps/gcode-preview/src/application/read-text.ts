// SPDX-License-Identifier: AGPL-3.0-or-later
// Port and use case of the lazy text pane: read a bounded window of a file around an offset.
import { readRange, textWindow, validRequest, type TextWindow } from '../domain/text-window.ts';

/** Reads up to `length` bytes of the file from `position` (fewer at the end of the file). */
export type ReadAt = (position: number, length: number) => Promise<Uint8Array>;

/** The window answering `request`, or undefined for a request that is not a valid one. */
export const readTextWindow = async (readAt: ReadAt, request: unknown): Promise<TextWindow | undefined> => {
  if (!validRequest(request)) return undefined;
  const { start, length } = readRange(request.offset);
  return textWindow(request.seq, await readAt(start, length), start, request.offset);
};
