---
id: 326
title: "Test random planes and boolean pairs: closed manifold results or a refusal"
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [325]
created: 2026-10-25
---

Property test over the fixtures: random planes and random operand pairs always give a closed manifold mesh or a typed refusal, never a mesh with open edges.

**Code:** `vsslicer/modules/mesh-boolean/test/property/` (module: `mesh-boolean`, layer: n/a (tests))

## Acceptance criteria

- [ ] 1,000 random cuts and 500 random boolean pairs pass on the fixtures in CI time under five minutes
- [ ] A deliberately broken kernel result is caught (meta-test)

## Tasks

- [ ] Generator
- [ ] Property test
- [ ] Meta-test

## Progress

Not started.
