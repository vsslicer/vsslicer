---
id: US25
title: "Open a Bambu 3MF, slice, preview and print on the H2C"
status: reviewed
epic: VSS:E29
---

As a user, I want to open a Bambu 3MF with an imported profile, slice it, preview it and send it to my H2C, so that the first complete loop works.

## Acceptance criteria

- [ ] On the owner's machine a Bambu 3MF with an imported profile is sliced, previewed in `vsslicer.gcode` and printed on the H2C via `vsslicer.bambu`; firmware and Orca versions recorded (D5)
- [ ] CI runs the same chain against the fake MQTT broker and FTPS fixture from PRN
- [ ] The `.gcode.3mf` assembled by US10 is the file that prints

## Out of scope

- Printers other than the H2C (D5)
