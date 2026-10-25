---
id: 229
title: "Spike: self-intersection removal in TypeScript, a CGAL WASM build or manifold-3d"
type: spike
priority: P1
effort: M
model: opus
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [228, 44]
created: 2026-10-25
---

Orca's self-intersection removal is built on CGAL. This spike compares a TypeScript implementation, a CGAL WASM build (an innovation token, with the licence of the CGAL packages used) and manifold-3d's repair features (shared with the cut tool) on the fixtures, and picks one.

**Code:** `vsslicer/modules/mesh/docs/self-intersection-spike.md` (module: `mesh`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] Per route: fixtures repaired, volume difference to Orca, time, size added to the package, licence
- [ ] The chosen route and the reasons are written down; the licence check of any CGAL package is recorded
- [ ] If WASM is chosen, the cards after this one are re-pointed to an adapter (noted in the spike)

## Tasks

- [ ] Prototype each route
- [ ] Measure on the fixtures
- [ ] Licence check
- [ ] Decide

## Progress

Not started.
