---
id: 157
title: "Open printer:// G-code in the preview"
type: feature
priority: P1
effort: S
model: sonnet
area: [storage]
story: US30
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [154, GCP-30, GCP-50]
created: 2026-10-25
---

Associate `printer://` G-code files with the `vsslicer.gcode` custom editor.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Integration test with the GCP editor: opening a `printer://` `.gcode` opens the preview; without the preview extension the file opens as text

## Tasks

- [ ] Editor association
- [ ] Integration test

## Progress

Not started.
