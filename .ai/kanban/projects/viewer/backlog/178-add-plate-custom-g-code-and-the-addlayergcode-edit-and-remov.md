---
id: 178
title: "Add plate custom G-code and the addLayerGcode, edit and remove commands"
type: feature
priority: P1
effort: M
model: sonnet
area: [plates]
story: US53
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [177, 173, 170]
created: 2026-10-25
---

`ProjectModel.addLayerGcode(plate, z, entry)` plus edit and remove, and a command to set the plate's custom G-code.

**Code:** `vsslicer/modules/project-extension/src/application/commands/plates/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] The entry is stored on the plate at the snapped height and written to `custom_gcode_per_layer.xml` by the writer
- [ ] Add then undo restores the plate
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Plate custom G-code
- [ ] Tests

## Progress

Not started.
