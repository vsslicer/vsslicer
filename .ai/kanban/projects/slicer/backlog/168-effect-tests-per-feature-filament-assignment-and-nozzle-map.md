---
id: 168
title: "Effect tests: per-feature filament assignment and nozzle map"
type: chore
priority: P2
effort: M
model: sonnet
area: [engine, multimaterial]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP38"
depends_on: [87, 160, GCP-4]
created: 2026-10-25
---

Effect tests for the Orca `*_filament_id` keys, Cura support and adhesion extruder settings, and `filament_map` with `filament_map_mode`.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] Tool numbers per role in the parsed G-code match the assignment, for each engine that supports it
- [ ] A manual `filament_map` is honoured in the tool changes of the fixture
- [ ] An engine without a key asserts its `unsupported` entry

## Tasks

- [ ] Define the tests
- [ ] Tool-per-role helper
- [ ] Canned G-code tests

## Progress

Not started.
