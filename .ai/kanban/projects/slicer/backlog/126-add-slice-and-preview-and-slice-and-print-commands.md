---
id: 126
title: "Add 'Slice and preview' and 'Slice and print' commands"
type: feature
priority: P1
effort: S
model: sonnet
area: [tasks]
story: US24
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [125, 119, GCP-50]
created: 2026-10-25
---

'Slice and preview' opens the result with `GcodePreview.open` (the `vsslicer.gcode` exports, GCP-50); 'Slice and print' chains upload and start.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] After a fake-engine slice the preview command is called with the staged file (stub extension spies the export)
- [ ] 'Slice and print' calls the print use case after a successful slice only
- [ ] Both stop on failure

## Tasks

- [ ] Commands
- [ ] Tests with stubs

## Progress

Not started.
