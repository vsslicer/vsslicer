---
id: 32
title: Import fdm_materials XML as material entities
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [30, 23, 135]
created: 2026-10-25
---

Maps each `fdmmaterial` v1.3 XML file to one `material` through the XML-key-to-setting table, with the CC0 fdm_materials@0c05969 bundled.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/materials/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Every XML file of fdm_materials@0c05969 yields exactly one `material`; density, diameter, GUID (as `external_ids.cura_guid`), brand and type are populated
- [ ] A malformed XML file gives a diagnostic and the rest import

## Tasks

- [ ] Write the XML reader
- [ ] Apply the XML-key table
- [ ] Count test

## Progress

Not started.
