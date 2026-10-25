---
id: 17
title: Resolve Production sub-models and required extensions
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [16]
created: 2026-10-25
---

Follows `p:path` into sub-model parts, and treats unsupported required extensions as read-only with a notice. Needed because Bambu and Orca keep geometry in sub-models.

**Code:** `vsslicer/modules/3mf/src/adapters/model/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Objects referenced through `p:path` resolve across sub-models on the Bambu/Orca fixtures
- [ ] A Production path to a missing part gives the typed error and message
- [ ] A package requiring Slice, Beam Lattice, Volumetric, Boolean, Displacement or Secure Content opens read-only and the notice names the extension

## Tasks

- [ ] Resolve p:path across parts
- [ ] Handle required extensions
- [ ] Tests

## Progress

Not started.
