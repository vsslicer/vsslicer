---
id: 51
title: "Read the plate's filaments from a .gcode.3mf"
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US10
milestone: "VSS:M3"
depends_on: [49, 48, VWR-74]
created: 2026-10-25
---

Turn the plate/filament info of a `.gcode.3mf` into the `PlateFilament[]` the AMS mapper takes.

**Code:** `vsslicer/modules/bambu-extension/src/application/...` (module: `bambu-extension`, layer: `application`)

UNRESOLVED: needs 3mf (plates and filament list of `.gcode.3mf`).

## Acceptance criteria

- [ ] Fixture `.gcode.3mf` plates (single- and multi-colour) yield type, colour and used grams per filament
- [ ] A file without plate info gives a clear error, not an empty list

## Tasks

- [ ] 3mf reader call
- [ ] Conversion
- [ ] Fixture tests

## Progress

Not started.
