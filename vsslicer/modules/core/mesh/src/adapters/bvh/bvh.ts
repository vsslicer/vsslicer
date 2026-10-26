// SPDX-License-Identifier: AGPL-3.0-or-later
// three-mesh-bvh and three are MIT; used as libraries, no code copied.
import { BufferAttribute, BufferGeometry } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import type { SerialisedBvh } from '../../application/model-worker.ts';
import type { IndexedMesh } from '../../domain/indexed-mesh.ts';

export type { SerialisedBvh };

function geometryOf(mesh: IndexedMesh): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(mesh.positions, 3));
  geometry.setIndex(new BufferAttribute(mesh.indices, 1));
  return geometry;
}

/**
 * Build a BVH over the mesh. `indirect` keeps `mesh.indices` untouched, so hit `faceIndex`
 * is the mesh's own triangle number (parts and painting stay valid) and the mesh is not mutated.
 */
export function buildBvh(mesh: IndexedMesh): MeshBVH {
  return new MeshBVH(geometryOf(mesh), { indirect: true });
}

/** The BVH's buffers (not copied: the BVH must not be used after they are transferred) and their transfer list. */
export function serialiseBvh(bvh: MeshBVH): { data: SerialisedBvh; transfer: ArrayBuffer[] } {
  const s = MeshBVH.serialize(bvh, { cloneBuffers: false });
  const indirectBuffer = s.indirectBuffer as Uint16Array | Uint32Array; // always set: built with `indirect`
  return {
    data: { roots: s.roots, indirectBuffer },
    transfer: [...s.roots, indirectBuffer.buffer as ArrayBuffer],
  };
}

/** Rebuild a BVH from `serialiseBvh` data over the same mesh, without rebuilding the tree. */
export function deserialiseBvh(data: SerialisedBvh, mesh: IndexedMesh): MeshBVH {
  // version 1 is the format serialize writes; without it deserialize "fixes up" the roots as old data
  const serialised = { version: 1, roots: data.roots, index: mesh.indices, indirectBuffer: data.indirectBuffer };
  return MeshBVH.deserialize(serialised, geometryOf(mesh), { setIndex: false });
}
