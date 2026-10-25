---
id: 249
title: Add the CuraEngine settings-file writer to cura-settings
type: refactor
priority: P2
effort: M
model: sonnet
area: [embedded]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [248, 64, 82]
created: 2026-10-25
---

The embedded engine needs the same resolved-settings input file as `slicer-cura`, and adapters may not depend on each other: the writer moves into `cura-settings` (a copy first, tests moved with it).

**Code:** `vsslicer/modules/cura-settings/src/domain/...` (module: `cura-settings`, layer: `domain`)

## Acceptance criteria

- [ ] `writeEngineSettings(resolvedStack)` output equals what `slicer-cura` writes today for every oracle tuple (byte compare against the existing snapshots)
- [ ] Tests and snapshots move with the code; no behaviour change
- [ ] README documents the function

## Tasks

- [ ] Copy the writer and its tests
- [ ] Compare outputs
- [ ] Document

## Progress

Not started.
