---
id: 41
title: Parse OBJ with groups
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [38, 35]
created: 2026-10-25
---

OBJ parser for geometry only: triangulates quads and n-gons, handles negative indices, groups become parts, `.mtl` ignored.

**Code:** `vsslicer/modules/mesh/src/adapters/obj/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Counts and bounding boxes equal three.js OBJLoader on the fixtures
- [ ] Face index out of range raises the typed error
- [ ] Groups map to parts

## Tasks

- [ ] Parser
- [ ] Triangulation
- [ ] Tests

## Progress

Not started.
