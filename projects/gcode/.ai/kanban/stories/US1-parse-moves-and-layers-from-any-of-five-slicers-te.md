---
id: US1
title: "Parse moves and layers from any of five slicers' text G-code"
status: reviewed
epic: VSS:E3
---

As a developer of the preview, planners and language features, I want `@vsslicer/gcode` to stream a text G-code file from PrusaSlicer, SuperSlicer, Orca, Bambu Studio or Cura into compact move buffers with a layer table, roles and diagnostics, in a worker, so every later epic builds on one data contract.

## Acceptance criteria

- [ ] Golden corpus from five slicers is checked in and its golden JSON (move count, layer count, role histogram) is compared in vitest
- [ ] Motion, modal and tool state commands in the epic scope are parsed; unknown commands are kept as named markers
- [ ] Both tag sets and Cura tags give roles and layers; a file with no tags still parses with role `unknown` and a diagnostic
- [ ] Move buffers are at or under 28 bytes per move and transfer as ArrayBuffers
- [ ] Parsing runs in a worker with cancel, progress and a memory cap; a parser failure becomes a typed error in the host

## Out of scope

- Arcs (US3), `.bgcode` (US4), `.gcode.3mf` (US5), metadata (US2), timing (E4)
