---
id: 11
title: Check the evaluator against 50 hand-computed Prusa compatibility conditions
type: chore
priority: P0
effort: M
model: opus
area: [evaluator]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [135, 10, PLT-13, 119]
created: 2026-10-25
---

The external oracle for the evaluator: conditions sampled from the 822 in `PrusaResearch.ini` and the 3.0 YAML forms, expected results worked out by hand from `Preset.cpp:390-421`.

**Code:** `vsslicer/modules/profiles-prusa/test/fixtures/conditions/` (module: `profiles-prusa`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] At least 50 conditions with printer fixtures and expected booleans, each citing the native rule used in `PROVENANCE.md`; the evaluator matches all
- [ ] The sample covers `nozzle_diameter[0]`, `printer_model` regex, `printer_notes`, `and`/`or`/`not`, `!~` and the 3.0 YAML forms
- [ ] A deliberately wrong expectation fails the test (guard against a vacuous suite)

## Tasks

- [ ] Sample the conditions
- [ ] Compute expectations by hand and review them
- [ ] Write the table-driven test

## Progress

Not started.
