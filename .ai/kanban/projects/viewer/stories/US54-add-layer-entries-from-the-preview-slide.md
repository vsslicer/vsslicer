---
id: US54
title: "Add layer entries from the preview slider"
status: reviewed
epic: VSS:E34
---

As the author of the G-code preview, I want a project command to add, change or remove a layer entry, so that the preview's layer slider can insert a pause or a colour change without sharing state.

## Acceptance criteria

- [ ] `ProjectModel.addLayerGcode(plate, z, entry)` and its remove and edit counterparts are exported and undoable
- [ ] A contract test with the preview's slider command adds an entry that is stored on the right plate
- [ ] The only coupling is the exported command (no shared state)
- [ ] Verified in the VS Code test host (D5)

## Out of scope

- Slider UI (GCP)
