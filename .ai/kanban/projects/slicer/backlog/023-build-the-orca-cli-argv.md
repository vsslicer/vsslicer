---
id: 23
title: Build the Orca CLI argv
type: feature
priority: P0
effort: S
model: sonnet
area: [orca, engine]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [7]
created: 2026-10-25
---

Pure function from a job to an argv array: `--slice N`, `--load-settings`, `--load-filaments`, `--outputdir`, `--pipe` where supported, and extra `--key=value` overrides. No shell quoting.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] Snapshot tests of argv for single plate, all plates and multi-filament jobs
- [ ] Plate numbers are validated; paths with spaces and unicode stay single arguments
- [ ] `--pipe` is added only when the install supports it

## Tasks

- [ ] Argv builder
- [ ] Snapshots
- [ ] Validation

## Progress

Not started.
