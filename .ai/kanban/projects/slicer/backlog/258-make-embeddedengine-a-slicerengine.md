---
id: 258
title: Make `EmbeddedEngine` a `SlicerEngine`
type: feature
priority: P2
effort: M
model: sonnet
area: [embedded]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [250, 256, 257, 7, 64, 14]
created: 2026-10-25
---

Resolves the Cura stack with `cura-settings`, writes the settings with the shared writer, exports the plate's objects as STL and runs the engine.

**Code:** `vsslicer/modules/slicer-embedded/src/application/...` (module: `slicer-embedded`, layer: `application`)

## Acceptance criteria

- [ ] The contract suite of `slicer-api` passes against the adapter
- [ ] Detection always reports "available" and names the engine version and revision
- [ ] The same oracle tuples as `slicer-cura` slice without a missing-setting log line

## Tasks

- [ ] Compose
- [ ] Contract suite
- [ ] Oracle tuples

## Progress

Not started.
