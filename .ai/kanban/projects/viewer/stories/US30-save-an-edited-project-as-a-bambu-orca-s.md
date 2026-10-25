---
id: US30
title: "Save an edited project as a Bambu/Orca-shaped 3MF that Orca and Bambu Studio open"
status: reviewed
epic: VSS:E31
---

As a user who edited a project in VS Code, I want to save it as a 3MF that Orca, Bambu Studio and the pinned Orca CLI open with the same plates, objects, parts and settings, so that I can carry on in any of them and print from the H2C.

## Acceptance criteria

- [ ] Property test: random `Project` values written then read by `readProject` compare equal (plates, objects, parts, instances, transforms, per-object config)
- [ ] Every fixture project, edited by a scripted set of operations and saved, re-slices with the pinned Orca CLI with the same plate count and object names in the output; this runs in CI
- [ ] The model is written as core plus Production split models; UUIDs stay the same across saves; `model_settings.config`, `project_settings.config`, embedded presets and the layer and cut files follow the Bambu/Orca layout
- [ ] `Application` is `VSSlicer-<version>`, never another vendor's; our own data sits in `Metadata/vsslicer/*` behind a MustPreserve relationship
- [ ] The spike result on whether Orca and Bambu Studio still read a non-Bambu `Application` is recorded, with the owner decision if either refuses the file
- [ ] Manual matrix recorded per release: saved files open in the Orca and Bambu Studio GUIs with plates, objects and settings intact
- [ ] On the H2C: a VSSlicer-saved project, sliced by the Orca CLI and sent through the Bambu adapter, prints the expected plate (firmware version recorded); everything else is fixtures only (D5)

## Out of scope

- Prusa 2.x and Cura writers; painting attributes (E52); the `.gcode.3mf` sliced layout (E27)
