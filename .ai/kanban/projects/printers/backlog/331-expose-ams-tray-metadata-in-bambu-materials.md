---
id: 331
title: Expose AMS tray metadata in Bambu materials
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: "FIL:US30"
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [320, 148]
created: 2026-10-25
---

Maps `remain`, `remain_g`, `tag_uid`, `tray_uuid`, `tray_info_idx`, `tray_sub_brands`, `tray_weight`, `tray_diameter` and temperatures from the MQTT AMS report into `materials[]`.

**Code:** `vsslicer/modules/printer/bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] The H2C recorded session yields the fields per tray, `GFA00` as `tray_info_idx` for PLA Basic; absent fields stay undefined
- [ ] An all-zero `tag_uid` is passed through unchanged (interpretation belongs to the consumer)
- [ ] Partial pushes merge without losing earlier tray fields

## Tasks

- [ ] Map the fields
- [ ] Merge test
- [ ] Fixture tests

## Progress

Not started.
