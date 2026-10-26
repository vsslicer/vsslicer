// SPDX-License-Identifier: AGPL-3.0-or-later
// The measured work, shared by both hosts (VWR-50): parse (binary STL, its weld included), dedup (weld alone on the
// same soup) and BVH. `mark` is a handshake: it resolves once the host has sampled and switched stage, so the next stage allocates nothing before that.
import { buildBvh } from '../../src/adapters/bvh/bvh.ts';
import { parseBinaryStl } from '../../src/adapters/stl/binary-stl.ts';
import { weld } from '../../src/domain/build-mesh.ts';

export const STAGES = ['parse', 'dedup', 'bvh'] as const;
export type Stage = (typeof STAGES)[number];
export interface StageResult {
  triangles: number;
  vertices: number;
  ms: Record<Stage, number>;
  /** This thread's CPU time per stage, where the host has a clock for it (Node); wall time inflates on a busy machine. */
  cpuMs?: Record<Stage, number>;
}

export async function runStages(
  bytes: Uint8Array,
  mark: (stage: Stage, edge: 'start' | 'end') => Promise<void>,
  cpuClockMs?: () => number,
) {
  const ms = {} as Record<Stage, number>;
  const cpuMs = {} as Record<Stage, number>;
  const timed = async <T>(stage: Stage, work: () => T | Promise<T>): Promise<T> => {
    await mark(stage, 'start');
    const t = performance.now();
    const c = cpuClockMs?.() ?? 0;
    const out = await work();
    ms[stage] = Math.round(performance.now() - t);
    if (cpuClockMs) cpuMs[stage] = Math.round(cpuClockMs() - c);
    await mark(stage, 'end');
    return out;
  };
  const mesh = await timed('parse', () => parseBinaryStl([bytes]));
  const { positions: p, indices: ix } = mesh;
  // The parser's soup rebuilt from the mesh (same floats, same order), outside the timed window.
  let soup: Float32Array | undefined = new Float32Array(ix.length * 3);
  for (let i = 0; i < ix.length; i++) soup.set(p.subarray(3 * ix[i]!, 3 * ix[i]! + 3), 3 * i);
  const weldedIndices = await timed('dedup', () => weld(soup!).indices.length); // the welded mesh is dropped here
  if (weldedIndices !== ix.length) throw new Error('dedup changed the triangle count');
  soup = undefined;
  await timed('bvh', () => buildBvh(mesh));
  return { triangles: ix.length / 3, vertices: p.length / 3, ms, ...(cpuClockMs && { cpuMs }) } satisfies StageResult;
}
