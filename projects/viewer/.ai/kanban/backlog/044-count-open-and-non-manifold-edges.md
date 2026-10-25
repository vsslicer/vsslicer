---
id: 44
title: Count open and non-manifold edges
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US13
milestone: "VSS:M2"
depends_on: [43]
created: 2026-10-25
---

Edge-use counting on the indexed mesh to report open edges and non-manifold edges; no repair.

**Code:** `vsslicer/modules/mesh/src/domain/stats/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Open and non-manifold edge counts equal admesh's report on every fixture
- [ ] A closed cube reports zero of each

## Tasks

- [ ] Edge map
- [ ] Tests against recorded admesh numbers

## Progress

Not started.
