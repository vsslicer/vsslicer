---
id: US45
title: "Open a profile's template field in the template editor"
status: reviewed
epic: VSS:E50
---

As a user editing a profile, I want to open a G-code template field of the profile form in a real editor with completion, and have my edits saved back to the field, so that I do not edit a long script in a small text box.

## Acceptance criteria

- [ ] A command `vsslicer.gcode.editTemplate` opens the template in a `gcode-template` editor with the right slicer and template kind, and calls the caller's save command with the new text on save
- [ ] The arguments are serialisable, so the profile form can call it from another extension host
- [ ] Closing without saving changes nothing in the profile

## Out of scope

- The button in the profile form (the profiles board, story US65).
