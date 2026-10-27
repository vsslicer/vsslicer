---
id: 139
title: Define the file-icon theme and test its coverage
type: feature
priority: P3
effort: S
model: sonnet
area: [themes]
story: US69
milestone: "VSS:M8"
sprint: "VSS:SP52"
depends_on: [138]
created: 2026-10-25
---

Generates the icon theme definition and tests that every listed extension resolves to an icon, including the compound `.gcode.3mf`.

**Code:** `vsslicer/modules/apps/themes/src/domain/icon-theme.ts` (module: `themes`, layer: `domain`)

## Acceptance criteria

- [ ] `.3mf`, `.stl`, `.obj`, `.step`, `.stp`, `.gcode`, `.bgcode`, `.gcode.3mf` and the profile extensions (`.ini`, `.json` profile names, `.curaprofile`) map to an icon; a test lists each mapping
- [ ] `.gcode.3mf` maps to the sliced-3MF icon, not the 3MF icon (longest-suffix rule tested)
- [ ] Unknown extensions fall back to the default file icon

## Tasks

- [ ] Write the mapping data and generator
- [ ] Write the coverage test

## Progress

Not started.
