---
id: US51
title: "A user's sent file carries the VSSlicer job id so printer-side records can be matched"
status: reviewed
epic: VSS:E46
---

As a user who later finds a job on the printer's own screen or web UI, I want the file VSSlicer sends to carry its job id, so that the printer's record and the VSSlicer record can be matched.

## Acceptance criteria

- [ ] Plain G-code gets a header comment with the id; a Moonraker metadata-parsing fixture ignores it
- [ ] A `.gcode.3mf` gets a metadata entry through `@vsslicer/3mf` and round-trips; the id survives, other parts are untouched
- [ ] The H2C still prints a `.gcode.3mf` with the entry (firmware recorded); the spike fixes the entry name before the format is used
- [ ] A setting turns embedding off: the file is sent untouched and history still records from the sender side
- [ ] Uploads compute their checksum after the edit (Moonraker fixture test)

## Out of scope

- Editing files that VSSlicer did not send.
- Bambu cloud matching.
