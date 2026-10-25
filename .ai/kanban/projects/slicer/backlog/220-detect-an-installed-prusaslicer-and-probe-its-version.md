---
id: 220
title: Detect an installed PrusaSlicer and probe its version
type: feature
priority: P2
effort: S
model: sonnet
area: [prusa]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [7, 219]
created: 2026-10-25
---

Finds `prusa-slicer` from the setting, the PATH and the usual install locations, runs `--version`, and reports compatible, too old or not found.

**Code:** `vsslicer/modules/slicer-prusa/src/adapters/...` (module: `slicer-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] A stub binary prints a version and is accepted; a version below the pinned range gives the typed "too old" error
- [ ] A missing binary gives the not-found result listing the places searched
- [ ] Detection never starts a GUI

## Tasks

- [ ] Search locations
- [ ] Probe
- [ ] Tests with stub binaries

## Progress

Not started.
