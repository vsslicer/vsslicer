---
id: 168
title: Write plate flags and settings
type: feature
priority: P1
effort: S
model: sonnet
area: [plates, 3mf]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [166, 167, 81]
created: 2026-10-25
---

Writes the plate fields in the Bambu/Orca plate config; defaults are omitted.

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Read, write, read gives equal plates on every fixture
- [ ] A plate with only defaults writes no extra keys

## Tasks

- [ ] Writer
- [ ] Round-trip test

## Progress

Not started.
