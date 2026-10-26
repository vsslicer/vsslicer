---
id: 25
title: Read PrusaSlicer 2.x config and objects
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US6
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [20, 11]
created: 2026-10-25
---

Reads `Slic3r_PE.config` as a raw INI blob and `Slic3r_PE_model.config` objects, volumes and per-object config.

Ported from `PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/3mf_legacy.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/prusa/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Objects, volumes (parts, modifiers) and per-object config match a golden hand-checked against PrusaSlicer 2.9
- [ ] The raw INI blob equals the part's bytes
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port object and volume parsing
- [ ] Raw INI blob
- [ ] Golden

## Progress

Not started.
