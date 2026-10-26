// SPDX-License-Identifier: AGPL-3.0-or-later
import type { BoundingBox } from './indexed-mesh.ts';

/** Health report of a mesh. Open and non-manifold counts are edges; they match admesh's report. */
export interface MeshStats {
  readonly triangleCount: number;
  readonly vertexCount: number;
  readonly bounds: BoundingBox;
  /** Signed volume in mesh units cubed; negative for an inside-out mesh. */
  readonly volume: number;
  /** Edges used by one triangle. */
  readonly openEdges: number;
  /** Edges used by three or more triangles. */
  readonly nonManifoldEdges: number;
  /** Triangles with zero area. */
  readonly degenerateTriangles: number;
}
