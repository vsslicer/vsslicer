---
id: 80
title: "Write model_settings.config objects, parts and per-volume config"
type: feature
priority: P1
effort: M
model: opus
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [78, 22, 9]
created: 2026-10-25
---

Writes objects, their parts (volumes) with subtype, names, transforms and per-object, per-part and modifier config in Orca's key order. Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Output on the Bambu and Orca fixtures equals the original `model_settings.config` object section semantically (XML canonical compare)
- [ ] Each volume kind is written with the subtype the Orca CLI reads (checked later in the oracle cards)
- [ ] The Bambu/Orca reader returns every field this card writes; any field it lacks is added to the reader here
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port the object and volume serialiser
- [ ] Per-volume config
- [ ] Reader gap check
- [ ] Tests

## Progress

Not started.
