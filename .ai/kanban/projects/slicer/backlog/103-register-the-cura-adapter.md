---
id: 103
title: Register the Cura adapter
type: chore
priority: P1
effort: XS
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [102, 82]
created: 2026-10-25
---

Adds `CuraEngine` to the registry next to Orca.

**Code:** `vsslicer/modules/apps/slicer/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] The registry lists Cura with detection result
- [ ] Setting `engine = cura` selects it (test)

## Tasks

- [ ] Register
- [ ] Test

## Progress

Not started.
