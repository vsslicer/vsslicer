---
id: 321
title: "Convert an IndexedMesh to a Manifold and back, keeping the originating faces and refusing non-manifold input"
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [320, 75]
created: 2026-10-25
---

The only place that touches the manifold API: builds a Manifold from an indexed mesh, reads a MeshGL back as an indexed mesh with the originating triangle of each output triangle, and checks input with the mesh statistics first.

**Code:** `vsslicer/modules/mesh-boolean/src/adapters/manifold/convert.ts` (module: `mesh-boolean`, layer: `adapters`)

## Acceptance criteria

- [ ] Input with open or non-manifold edges is refused before the kernel runs, with the edge counts in the message
- [ ] A closed fixture converts there and back with equal volume and triangle count
- [ ] Output triangles carry the index of the input triangle they came from (or the chosen fallback from the spike)

## Tasks

- [ ] Mesh to Manifold
- [ ] Manifold to mesh
- [ ] Input check
- [ ] Tests

## Progress

Not started.
