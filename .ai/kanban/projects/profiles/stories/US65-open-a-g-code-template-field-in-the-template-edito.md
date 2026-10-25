---
id: US65
title: "Open a G-code template field in the template editor from the profile form"
status: reviewed
epic: VSS:E50
---

As a user editing a printer or filament profile, I want an Edit in template editor action on G-code fields, so that the long start script opens with completion and hover and saves back to the field.

## Acceptance criteria

- [ ] Each G-code field in the profile form (start, end, layer change, tool change, pause, filament start and end) offers the action, which opens the template with the right slicer dialect and template kind
- [ ] Saving in the template editor writes the text back to the field through the form's normal edit path (undo works); closing without saving changes nothing
- [ ] The action is hidden when `vsslicer.gcode` is not installed

## Out of scope

- The editor, catalogue and completion (the G-code board, stories US40 to US47).
