---
id: 93
title: Convert a PrusaSlicer 2.x project to the Bambu/Orca shape with a conversion report
type: feature
priority: P1
effort: M
model: opus
area: [3mf]
story: US33
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [87, 25, 26]
created: 2026-10-25
---

Maps PrusaSlicer 2.x objects, volumes, ranges and settings to the `Project` shape the Bambu/Orca writer saves, and reports what was converted and what stays only as preserved parts.

**Code:** `vsslicer/modules/core/3mf/src/adapters/convert/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The Prusa 2.9 fixtures convert, save and read back with the same objects, volumes and instances
- [ ] The report names every key kept only as a preserved part
- [ ] The original file is not touched by the conversion

## Tasks

- [ ] Mapping tables
- [ ] Report
- [ ] Tests

## Progress

Not started.
