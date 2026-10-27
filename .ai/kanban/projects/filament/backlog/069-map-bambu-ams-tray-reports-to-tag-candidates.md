---
id: 69
title: Map Bambu AMS tray reports to tag candidates
type: feature
priority: P2
effort: M
model: sonnet
area: [tags]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [68, PRN-320, PRN-334]
created: 2026-10-25
---

From a tray report (`tag_uid`, `tray_uuid`, `tray_info_idx`, `tray_type`, `tray_sub_brands`, `tray_color`, `cols`, `tray_weight`, `tray_diameter`, temperatures) build a candidate with the all-zero rule applied. Field facts from `ha-bambulab@0e027ff` (MIT) and BambuStudio read for behaviour only (`DevFilaSystem.cpp:502-511`).

UNRESOLVED: needs printer-bambu/printer-api: tray tag and metadata fields in `materials[]`; PRN-4 has only tray, type, colour and remain.

**Code:** `vsslicer/modules/filament/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Recorded tray fixtures (from the printers recordings) map to the expected candidates, with `GFA00` as `tray_info_idx` in the PLA Basic case
- [ ] An all-zero `tag_uid` yields an untagged candidate

## Tasks

- [ ] Write the mapper
- [ ] Fixture tests

## Progress

Not started.
