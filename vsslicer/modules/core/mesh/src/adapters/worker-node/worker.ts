// SPDX-License-Identifier: AGPL-3.0-or-later
import { parentPort } from 'node:worker_threads';
import { parseModel } from '../parse-model.ts';
import type { ParseModelOptions } from '../../application/parse-model.ts';
import { buildBvh, serialiseBvh } from '../bvh/bvh.ts';
import { toWire } from './errors.ts';

/** Worker entry: one request in, one answer out, then the thread has nothing left to do. */
parentPort!.once('message', async (req: { bytes: Uint8Array; opts: ParseModelOptions }) => {
  try {
    const r = await parseModel(req.bytes, req.opts);
    if (r.kind !== 'parsed') return parentPort!.postMessage({ ok: true, result: r });
    const bvh = serialiseBvh(buildBvh(r.mesh));
    const transfer = [...new Set([r.mesh.positions.buffer, r.mesh.indices.buffer, ...bvh.transfer])] as ArrayBuffer[];
    parentPort!.postMessage({ ok: true, result: { ...r, bvh: bvh.data } }, transfer);
  } catch (e) {
    parentPort!.postMessage({ ok: false, error: toWire(e) });
  }
});
