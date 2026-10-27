---
id: 222
title: Build the PrusaSlicer argv with a private datadir
type: feature
priority: P2
effort: S
model: sonnet
area: [prusa]
story: US66
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [7, 217]
created: 2026-10-25
---

Builds the argv: `--export-gcode` (or `--export-binary-gcode`), `--load` for each config, `--output`, and a private `--datadir` so the preset-update prompt cannot block slicing.

**Code:** `vsslicer/modules/slicer/prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] The argv equals the report's recorded one for the fixture cube; the datadir is inside the job's staging folder
- [ ] No argument goes through a shell; paths with spaces and unicode are one argv entry each (test)
- [ ] The 3.0 variant adds its flags only when the setting is on

## Tasks

- [ ] Argv builder
- [ ] Datadir handling
- [ ] Tests

## Progress

Not started.
