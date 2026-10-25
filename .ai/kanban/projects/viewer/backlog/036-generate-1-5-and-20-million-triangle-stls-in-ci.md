---
id: 36
title: "Generate 1, 5 and 20 million triangle STLs in CI"
type: chore
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [PLT-13, 34]
created: 2026-10-25
---

Synthetic large STLs through `tools/generate-large-fixture`, cached by CI, not committed.

**Code:** `vsslicer/tools/generate-large-fixture` mesh generator (module: `mesh`, layer: n/a (ci))

## Acceptance criteria

- [ ] Deterministic generators for 1, 5 and 20 M triangles (sphere or noise mesh) with a seed
- [ ] CI caches the output
- [ ] `tools/check-fixtures` passes

## Tasks

- [ ] Add the generator
- [ ] Cache in CI

## Progress

Not started.
