---
id: 49
title: "Spike: which `slice_info.config` fields the H2C firmware requires"
type: spike
priority: P1
effort: S
model: opus
area: [engine]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [43]
created: 2026-10-25
---

Compares an archive exported by Bambu Studio for the fixture plate with Orca's `--export-3mf` and finds which `slice_info.config` fields (filament list, prediction, weight, nozzle info) the H2C needs, by sending variants.

**Code:** `vsslicer/modules/slicer/output/` (module: `slicer-output`, layer: n/a (spike))

## Acceptance criteria

- [ ] A table of required and optional fields with the H2C firmware version and date
- [ ] The Bambu Studio export is stored as a fixture with provenance (owner exports it)
- [ ] Layout notes for `model_settings.config` and `project_settings.config` from `features-bambustudio-orcaslicer.md` section 6 are confirmed or corrected

## Tasks

- [ ] Export the plate from Bambu Studio and Orca
- [ ] Send variants to the H2C
- [ ] Record the table

## Progress

Not started.
