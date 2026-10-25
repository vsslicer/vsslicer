---
id: 62
title: Add Preview sliced plate
type: feature
priority: P0
effort: M
model: opus
area: [plates]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [61, GCP-50, GCP-16]
created: 2026-10-25
---

Command that calls `GcodePreview.open(uri, {plate})` from `vsslicer.gcode` and explains how to install it when missing.

**Code:** `vsslicer/modules/project-extension/src/presentation/commands/previewPlate.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] On a `.gcode.3mf` fixture the matching `plate_N.gcode` opens in `vsslicer.gcode`
- [ ] Without `vsslicer.gcode` the message gives install instructions
- [ ] A test against the GCP exports catches API drift

## Tasks

- [ ] Command
- [ ] Not-installed path
- [ ] Contract test

## Progress

Not started.
