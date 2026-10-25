---
id: 26
title: Import SuperSlicer INI with its 356 extra keys
type: feature
priority: P0
effort: S
model: sonnet
area: [importers]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [25, 135]
created: 2026-10-25
---

SuperSlicer INI uses the Prusa dialect; its extra keys must map through the catalogue or be listed native-only.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/import/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] A SuperSlicer@1f3d287 fixture bundle imports; each of the 356 extra keys is mapped (with `superslicer.` prefix where needed) or reported native-only
- [ ] Entities validate against the schema

## Tasks

- [ ] Add dialect detection
- [ ] Test with the SuperSlicer fixture

## Progress

Not started.
