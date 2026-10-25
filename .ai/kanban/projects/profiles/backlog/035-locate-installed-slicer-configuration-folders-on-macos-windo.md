---
id: 35
title: "Locate installed slicer configuration folders on macOS, Windows and Linux"
type: feature
priority: P0
effort: S
model: sonnet
area: [importers]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [135, 118]
created: 2026-10-25
---

`locateInstalledSlicers()` returns the PrusaSlicer, SuperSlicer, Orca, Bambu Studio and Cura config folders that exist, per OS.

**Code:** `vsslicer/modules/profiles/src/adapters/locate/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [ ] Table-driven tests over a fake file system for each OS layout (including Flatpak/Snap paths for Linux) return the expected folders
- [ ] A missing or unreadable folder is reported with a diagnostic, not thrown

## Tasks

- [ ] Write the OS path tables
- [ ] Write the tests

## Progress

Not started.
