---
id: 179
title: Report Cura one-at-a-time collisions and heights by object name
type: feature
priority: P2
effort: M
model: opus
area: [cura]
story: US58
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [81, 159, 73]
created: 2026-10-25
---

Finds out what CuraEngine reports for a colliding or too-tall one-at-a-time plate and maps it to a message naming the objects; if CuraEngine reports nothing, the adapter checks bounding boxes and the gantry height before slicing.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] The colliding fixture produces a message naming both objects, from the engine or from our pre-check (the choice is recorded with the recorded CuraEngine output)
- [ ] A non-colliding fixture passes the pre-check unchanged
- [ ] The pre-check uses the per-object exports of the adapter and the printer's gantry height setting

## Tasks

- [ ] Record CuraEngine behaviour
- [ ] Pre-check if needed
- [ ] Message mapping
- [ ] Tests

## Progress

Not started.
