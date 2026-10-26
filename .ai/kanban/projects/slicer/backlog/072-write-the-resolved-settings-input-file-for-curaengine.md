---
id: 72
title: Write the resolved-settings input file for CuraEngine
type: feature
priority: P1
effort: M
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [66, 64, PRF-135]
created: 2026-10-25
---

Turns `ResolvedCuraSettings` into the file the spike chose, with the global, per-extruder and per-model sections.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] Snapshot for each oracle tuple
- [ ] Every key the engine reads is present (checked against the key list from the spike)
- [ ] Values are typed as the engine expects (bool, float, string, vector)

## Tasks

- [ ] Writer
- [ ] Snapshots
- [ ] Key presence check

## Progress

Not started.
