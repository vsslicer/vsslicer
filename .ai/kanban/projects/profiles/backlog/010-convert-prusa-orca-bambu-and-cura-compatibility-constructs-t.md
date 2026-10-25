---
id: 10
title: Convert Prusa compatibility constructs to unified conditions
type: feature
priority: P0
effort: M
model: sonnet
area: [evaluator, importers]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [135, 119]
created: 2026-10-25
---

The PrusaSlicer rows of the `profiles.md` §6 conversion table as code, plus the per-vendor keyword-to-tag table for Prusa `printer_notes` tests.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/conditions/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] Each Prusa row of the §6 table has a converter and a unit test: `nozzle_diameter[0]==0.4`, `nozzle_high_flow[0]`, `printer_model==`/`=~`, `printer_notes=~` via the tag table, Prusa 3.0 `tool/feeder/base_model`
- [ ] The tag table covers every `printer_notes` keyword test found in `PrusaResearch.ini@b028299`; an unknown keyword yields a diagnostic and a lossy flag, not a silent drop
- [ ] Every converted output parses with the `profile-api` parser (release 0.1.0)

## Tasks

- [ ] Write the converters
- [ ] Build the tag table from the pinned bundle
- [ ] Write the tests

## Progress

Not started.
