---
id: 161
title: "Effect tests: sequential printing"
type: chore
priority: P2
effort: M
model: sonnet
area: [engine]
story: US58
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [87, 159, GCP-4]
created: 2026-10-25
---

Effect test for `print_sequence`, `complete_objects` and Cura `one_at_a_time`: the parser sees objects printed one after another in the set order.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Off and on slices of the non-colliding pair differ: with the feature on, object labels appear as two consecutive runs in the set order
- [ ] The definition records the regression it guards (field required)
- [ ] An engine marked unsupported is skipped with its entry asserted

## Tasks

- [ ] Define the test
- [ ] Order assertion from labels and layers
- [ ] Canned G-code tests

## Progress

Not started.
