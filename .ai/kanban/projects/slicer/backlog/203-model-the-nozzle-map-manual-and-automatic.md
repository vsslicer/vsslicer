---
id: 203
title: "Model the nozzle map: manual and automatic"
type: feature
priority: P2
effort: S
model: sonnet
area: [multimaterial]
story: US55
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [196]
created: 2026-10-25
---

`filament_map` and `filament_map_mode` as a model validated against the nozzle count found in MM2.

**Code:** `vsslicer/modules/multimaterial/src/domain/...` (module: `multimaterial`, layer: `domain`)

## Acceptance criteria

- [ ] A manual map with an index beyond the nozzle count is refused
- [ ] Automatic mode carries no map and a flag that the engine decides
- [ ] Keys round trip

## Tasks

- [ ] Model
- [ ] Validation
- [ ] Tests

## Progress

Not started.
