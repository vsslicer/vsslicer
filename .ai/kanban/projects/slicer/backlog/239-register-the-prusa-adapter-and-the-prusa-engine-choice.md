---
id: 239
title: Register the Prusa adapter and the `prusa` engine choice
type: feature
priority: P2
effort: S
model: sonnet
area: [prusa, engine]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [102, 232]
created: 2026-10-25
---

Adds `slicer-prusa` to the engine registry beside Orca and Cura.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] The registry lists the Prusa adapter with its detection result
- [ ] `vsslicer.slicer.engine = prusa` selects it; an unknown id still gives the typed error
- [ ] The package range is `@vsslicer/slicer-prusa` `^0.1.0`

## Tasks

- [ ] Register
- [ ] Detection fan-out
- [ ] Tests

## Progress

Not started.
