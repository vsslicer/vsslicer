---
id: 28
title: Decode extruder-variant arrays for H2D and H2C into keyed per-extruder values
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US12
milestone: "VSS:M2"
depends_on: [27, 135]
created: 2026-10-25
---

Bambu/Orca per-extruder-variant arrays need the printer's `printer_extruder_variant` list to be decoded into keyed values.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/variants/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] The 11 `Bambu Lab H2C` machine files (4 nozzle presets plus templates) import with the expected counts
- [ ] A decoded H2C 0.4 preset keeps both extruders' values under `{"0": .., "1": ..}` and re-encodes to the original array order (round-trip test on the H2C files)
- [ ] Fixture-based; the printer itself is not involved (D5)

## Tasks

- [ ] Decode the variant list
- [ ] Write keyed values
- [ ] Test on the H2C files

## Progress

Not started.
