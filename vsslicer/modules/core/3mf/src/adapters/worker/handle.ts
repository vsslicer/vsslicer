// SPDX-License-Identifier: AGPL-3.0-or-later
import { ThreeMfError } from '../../domain/errors.ts';
import { openPackage } from '../../openPackage.ts';
import { readProject } from '../../readProject.ts';
import type { WorkerRequest, WorkerResponse } from './protocol.ts';

/** Upper bound on values visited while collecting buffers; a Project is far smaller, so hitting it means a bug. */
const MAX_VISITED = 5_000_000;

/** Every ArrayBuffer behind a typed array in `root`, once each (a duplicate in a transfer list throws). */
export function collectBuffers(root: unknown): ArrayBuffer[] {
  const buffers = new Set<ArrayBuffer>();
  const seen = new Set<unknown>();
  const stack = [root];
  while (stack.length > 0) {
    const v = stack.pop();
    if (typeof v !== 'object' || v === null || seen.has(v)) continue;
    if (seen.size >= MAX_VISITED) throw new RangeError('result is too large to scan for transferable buffers');
    seen.add(v);
    if (ArrayBuffer.isView(v)) {
      if (v.buffer instanceof ArrayBuffer) buffers.add(v.buffer);
    } else if (v instanceof Map) for (const [k, x] of v) stack.push(k, x);
    // Loops, not push(...spread): a spread of ~125,000+ items overflows the call stack.
    else if (v instanceof Set || Array.isArray(v)) for (const x of v) stack.push(x);
    else for (const x of Object.values(v)) stack.push(x);
  }
  return [...buffers];
}

/** The shared body of both worker entries: bytes in, `openPackage` then `readProject`, a response and its transfer list. */
export function handle(request: WorkerRequest): { response: WorkerResponse; transfer: ArrayBuffer[] } {
  try {
    const { rootModel, parts, thumbnails, readOnly } = openPackage(request.bytes);
    const project = readProject({ rootModel, parts });
    const result = { rootModel, parts, thumbnails, ...(readOnly !== undefined && { readOnly }), project };
    return { response: { ok: true, result }, transfer: collectBuffers(result) };
  } catch (e) {
    if (e instanceof ThreeMfError)
      return { response: { ok: false, failure: { code: e.code, userMessage: e.userMessage } }, transfer: [] };
    throw e; // not a fault of the file's format: the entry lets the worker die and the client reports a crash
  }
}
