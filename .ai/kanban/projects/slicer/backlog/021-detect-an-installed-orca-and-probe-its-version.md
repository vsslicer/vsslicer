---
id: 21
title: Detect an installed Orca and probe its version
type: feature
priority: P0
effort: M
model: sonnet
area: [orca, engine]
story: US1
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [7, 19, 16]
created: 2026-10-25
---

Looks in the standard install paths on macOS, Windows and Linux and at the `vsslicer.slicer.orca.path` value, runs the version probe, and compares with the pinned version.

**Code:** `vsslicer/modules/slicer/orca/src/adapters/...` (module: `slicer-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] Stub installs on a temp tree for each OS layout are found; the setting wins over detection
- [ ] The version is parsed from the probe; an unsupported version yields a warning naming the pinned version
- [ ] A missing or non-executable path yields `not installed`, not an exception
- [ ] The probe is bounded by a timeout

## Tasks

- [ ] Path candidates per OS
- [ ] Version probe
- [ ] Tests with stub installs

## Progress

Not started.
