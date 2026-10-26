// SPDX-License-Identifier: AGPL-3.0-or-later

/** Axis-aligned box as `[x, y, z]` corners. */
export interface BoundingBox {
  readonly min: readonly [number, number, number];
  readonly max: readonly [number, number, number];
}

/** A named run of triangles (an OBJ group or object): triangles `firstTriangle` to `firstTriangle + triangleCount - 1`. */
export interface MeshPart {
  readonly name: string;
  readonly firstTriangle: number;
  readonly triangleCount: number;
}

/**
 * A triangle mesh in indexed form (about 24 bytes per triangle once vertices are shared).
 * `positions` is x,y,z per vertex; `indices` is three vertex numbers per triangle.
 * `parts` always covers every triangle in order: one part for a mesh without groups.
 */
export interface IndexedMesh {
  readonly positions: Float32Array;
  readonly indices: Uint32Array;
  readonly parts: readonly MeshPart[];
  readonly bounds: BoundingBox;
}
