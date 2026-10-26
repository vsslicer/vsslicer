---
id: 22
title: "Read Bambu and Orca objects, parts and instances"
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [21]
created: 2026-10-25
---

Ports `model_settings.config` object, part and instance parsing, with per-object metadata.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` and `BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Objects, parts (including modifiers and negative volumes), instances and per-object metadata match a golden JSON hand-checked against the GUI
- [ ] Painting attributes are kept as raw per-triangle strings
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Port object and part parsing
- [ ] Instances and transforms
- [ ] Golden JSON and hand-check
- [ ] Tests

## Progress

Not started.
