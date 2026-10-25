---
id: 90
title: "Effect tests: ironing and fuzzy skin"
type: feature
priority: P1
effort: S
model: sonnet
area: [engine]
story: US30
milestone: "VSS:M3"
depends_on: [87]
created: 2026-10-25
---

Ironing role on top layers; fuzzy-skin displacement of outer-wall points within the set thickness.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Ironing on: an ironing role exists on top layers; off: none
- [ ] Fuzzy skin on: outer-wall points deviate from the straight wall by at most the set thickness and by more than zero
- [ ] Each test names its regression

## Tasks

- [ ] Fixtures
- [ ] Assertions

## Progress

Not started.
