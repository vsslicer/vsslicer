---
id: 74
title: Build the CuraEngine command line and run it
type: feature
priority: P1
effort: M
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [72, 14, 7]
created: 2026-10-25
---

Always `-o <file>` (logs share stdout), the resolved-input route from the spike, and the definition search path where needed. Runs through the shared runner.

**Code:** `vsslicer/modules/slicer-cura/src/adapters/...` (module: `slicer-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Snapshot of argv per job kind
- [ ] The staged G-code appears only on exit 0
- [ ] An empty output file is an error

## Tasks

- [ ] Argv builder
- [ ] Run and stage
- [ ] Tests with stub

## Progress

Not started.
