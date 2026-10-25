---
id: 4
title: "Add multi-tool, IDEX and H2C dual-extruder fixtures that keep per-extruder values"
type: feature
priority: P2
effort: S
model: sonnet
area: [schema]
story: US10
milestone: "VSS:M2"
depends_on: [3]
created: 2026-10-25
---

Proves the schema can hold keyed per-extruder values and `toolheads`/`feeder` for the printers named in the epic, without positional arrays.

**Code:** `vsslicer/modules/profile-api/test/fixtures/multitool/` (module: `profile-api`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Hand-written fixtures for Prusa 3.0 `printer_config` XL 2T, an Orca IDEX machine and a Bambu H2D/H2C extruder-variant array validate against the schema
- [ ] Each fixture's per-extruder values read back by slot (`{"0": .., "1": ..}`) with the same numbers as the native source cited in `PROVENANCE.md`
- [ ] A negative fixture using a positional array for a per-extruder key fails with the expected path

## Tasks

- [ ] Write the three fixtures with provenance
- [ ] Add the read-back and negative tests

## Progress

Not started.
