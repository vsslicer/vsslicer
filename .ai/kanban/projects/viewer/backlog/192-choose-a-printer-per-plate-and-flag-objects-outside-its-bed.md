---
id: 192
title: Choose a printer per plate and flag objects outside its bed
type: feature
priority: P2
effort: M
model: sonnet
area: [plates]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP41"
depends_on: [183, 186, PRF-144]
created: 2026-10-25
---

A printer picker on the plate, listing instances from `profiles`, drawing the plate's own bed and marking objects outside it.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/plates/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Picking an instance changes the drawn bed of that plate
- [ ] An object outside is outlined and listed by name
- [ ] The save notice mentions the Orca interop limit when two printers are used

## Tasks

- [ ] Picker
- [ ] Bed drawing
- [ ] Flags

## Progress

Not started.
