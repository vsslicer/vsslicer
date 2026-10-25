---
id: 94
title: Convert a Cura workspace to the Bambu/Orca shape with a conversion report
type: feature
priority: P1
effort: M
model: opus
area: [3mf]
story: US33
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [87, 27]
created: 2026-10-25
---

Maps Cura workspace objects and per-object settings to the writer's `Project` and reports what is converted and what stays preserved.

**Code:** `vsslicer/modules/3mf/src/adapters/convert/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The Cura fixtures convert, save and read back with the same objects and positions
- [ ] The report names settings kept only as preserved parts
- [ ] The original file is not touched

## Tasks

- [ ] Mapping
- [ ] Report
- [ ] Tests

## Progress

Not started.
