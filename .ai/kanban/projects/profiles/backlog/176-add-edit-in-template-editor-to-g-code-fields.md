---
id: 176
title: Add Edit in template editor to G-code fields
type: feature
priority: P2
effort: S
model: sonnet
area: [form]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [76, GCP-74, 135]
created: 2026-10-25
---

The G-code widget gets an action that calls `vsslicer.gcode.editTemplate` with the field's text, the dialect (Prusa or Orca) and the template kind derived from the catalogue key, and a save command that writes the text back through the form's edit path.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/...` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] For a start G-code field of an Orca fixture and a Prusa fixture the command receives the right slicer and kind (stubbed command); the save command updates the field and undo restores it
- [ ] The action is hidden when the G-code extension is not installed
- [ ] A field of another type never shows the action

## Tasks

- [ ] Action
- [ ] Kind lookup
- [ ] Save command
- [ ] Tests

## Progress

Not started.
