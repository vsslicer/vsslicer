---
id: 22
title: Install the pinned Orca release into global storage
type: feature
priority: P0
effort: M
model: sonnet
area: [orca, engine]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [7, 14, 19, 17, 16]
created: 2026-10-25
---

Downloads the manifest entry for this OS with the verified downloader, extracts or prepares it (AppImage extract, zip, DMG as the spikes found) and registers it as an `EngineInstall`.

**Code:** `vsslicer/modules/slicer/orca/src/adapters/...` (module: `slicer-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] A local fixture archive installs end to end through the real downloader and extractor on all three OSes
- [ ] A failed step leaves no partial install directory
- [ ] A second install of the same version is a no-op

## Tasks

- [ ] Per-OS install steps
- [ ] Registration
- [ ] Tests with a fixture archive

## Progress

Not started.
