---
id: 261
title: Test that quality changes the triangle count monotonically and the preview matches
type: feature
priority: P1
effort: S
model: sonnet
area: [step, mesh]
story: US68
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [257, 253]
created: 2026-10-25
---

Imports the curved-face fixture at every preset.

**Code:** `vsslicer/modules/core/mesh-step/test/quality/` (module: `mesh-step`, layer: n/a (tests))

## Acceptance criteria

- [ ] Triangle count rises with every finer preset
- [ ] The preview count equals the import count at each preset

## Tasks

- [ ] Test

## Progress

Not started.
