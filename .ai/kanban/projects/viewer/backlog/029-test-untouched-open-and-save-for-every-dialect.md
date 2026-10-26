---
id: 29
title: Test untouched open and save for every dialect
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US9
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [9, 23, 25, 27]
created: 2026-10-25
---

One CI test opens and saves each fixture and compares every part, relationship and content type.

**Code:** `vsslicer/modules/3mf/test/roundtrip/` (module: `3mf`, layer: n/a (ci))

## Acceptance criteria

- [ ] Bytes are identical per part for Bambu Studio, OrcaSlicer, PrusaSlicer 2.9, Prusa 3.0 alpha and Cura fixtures
- [ ] Replacing one part leaves the others identical on each fixture
- [ ] A mutated saver fails the test (meta-test)

## Tasks

- [ ] Write the test
- [ ] Meta-test

## Progress

Not started.
