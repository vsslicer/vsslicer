---
id: 162
title: "Effect tests: mold, conical support, make-overhang-printable and gradual infill"
type: chore
priority: P2
effort: L
model: sonnet
area: [engine]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [87, 159, GCP-4]
created: 2026-10-25
---

One effect test per row: Cura `mold_*`, `support_conical_*`, `gradual_infill_*` and Orca `make_overhang_printable*`.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Each test shows a measurable change in roles, widths or Z extents between off and on, with the regression recorded
- [ ] A row an engine lacks asserts the `unsupported` entry
- [ ] All tests run against the fake engine with canned G-code in this module

## Tasks

- [ ] Define four tests
- [ ] Parser helpers for the measures
- [ ] Canned G-code tests

## Progress

Not started.
