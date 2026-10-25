---
id: 339
title: Mark cut parts and connector volumes so the writer emits cut information
type: feature
priority: P2
effort: S
model: sonnet
area: [editor, 3mf]
story: US89
milestone: "VSS:M5"
sprint: "VSS:SP33"
depends_on: [336, 334, 299]
created: 2026-10-25
---

Sets the cut id, check sum, connector count and connector flags on the parts and volumes a cut produces, in the shape the 3mf writer saves as `cut_information.xml`.

**Code:** `vsslicer/modules/project-extension/src/application/commands/cut/cutInfo.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A cut project saved and reopened keeps its cut information (equal structure)
- [ ] The saved file carries the same cut ids on both parts
- [ ] An object that was never cut writes no cut information

## Tasks

- [ ] Set cut info
- [ ] Round-trip test

## Progress

Not started.
