---
id: 68
title: Extract CuraEngine from the Cura AppImage and DMG
type: feature
priority: P1
effort: M
model: sonnet
area: [cura]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [14, 67]
created: 2026-10-25
---

Pulls the `CuraEngine` binary and its definitions out of the AppImage (self-extract) and the DMG (`hdiutil` attach and copy) into the install directory.

**Code:** `vsslicer/modules/slicer-cura/src/adapters/...` (module: `slicer-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] On Linux and macOS runners the extracted CuraEngine reports its version
- [ ] Definitions and `fdm_materials` needed by the engine are extracted next to it
- [ ] Failures remove the partial directory

## Tasks

- [ ] AppImage path
- [ ] DMG path
- [ ] Tests on runners

## Progress

Not started.
