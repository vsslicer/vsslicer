---
id: 292
title: Type the per-triangle attributes as named channels
type: feature
priority: P2
effort: S
model: sonnet
area: [3mf, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [78, 22]
created: 2026-10-25
---

Gives the raw per-triangle strings a shape: named channels (`paint_supports`, `paint_seam`, `paint_color`, and every other attribute by name) per mesh, so known paint can be decoded elsewhere and unknown attributes are kept and written back.

**Code:** `vsslicer/modules/3mf/src/domain/project/triangleChannels.ts` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [ ] A mesh holds channels as name to string array (empty string for unset); additive and optional so existing reader goldens do not change
- [ ] Unknown attributes (`paint_fuzzy_skin`, `paint_texture_*`, `face_property`) live in the same structure
- [ ] No I/O in the folder (lint)

## Tasks

- [ ] Types
- [ ] Reader goldens still pass

## Progress

Not started.
