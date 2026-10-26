// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ParseModelOptions } from '../../application/parse-model.ts';
import { buildBvh, serialiseBvh } from '../bvh/bvh.ts';
import { parseModel } from '../parse-model.ts';
import { toWire } from '../worker-node/errors.ts';

export interface ParseRequest {
  readonly bytes: Uint8Array;
  readonly opts: ParseModelOptions;
}

/** One request in, one reply out through `post(message, transferList)`. Pure of the worker global, so Node can test it. */
export async function handleParseRequest(
  req: ParseRequest,
  post: (message: unknown, transfer: ArrayBuffer[]) => void,
): Promise<void> {
  try {
    const r = await parseModel(req.bytes, req.opts);
    if (r.kind !== 'parsed') return post({ ok: true, result: r }, []);
    const bvh = serialiseBvh(buildBvh(r.mesh));
    const transfer = [...new Set([r.mesh.positions.buffer, r.mesh.indices.buffer, ...bvh.transfer])] as ArrayBuffer[];
    post({ ok: true, result: { ...r, bvh: bvh.data } }, transfer);
  } catch (e) {
    post({ ok: false, error: toWire(e) }, []);
  }
}
