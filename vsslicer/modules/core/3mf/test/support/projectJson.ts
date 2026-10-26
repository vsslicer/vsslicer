// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Project } from '../../src/domain/project/project.ts';

/** A Project as plain JSON for goldens: meshes by vertex and triangle count, maps as objects. */
export const projectJson = (p: Project): unknown => ({
  dialect: p.dialect,
  objects: p.objects.map((o) => ({
    id: o.id,
    name: o.name,
    config: Object.fromEntries(o.config),
    parts: o.parts.map((x) => ({
      id: x.id,
      name: x.name,
      ...(x.subtype !== undefined && { subtype: x.subtype }),
      vertices: x.mesh.vertices.length / 3,
      triangles: x.mesh.triangles.length / 3,
      transform: [...x.transform],
      config: Object.fromEntries(x.config),
      ...(x.triangleAttributes && { triangleAttributes: Object.fromEntries(x.triangleAttributes) }),
    })),
  })),
  instances: p.instances.map((i) => ({ objectId: i.objectId, transform: [...i.transform] })),
});
