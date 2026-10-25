---
id: US10
title: "A Bambu owner sends a sliced .gcode.3mf with AMS slot mapping and starts it"
status: reviewed
epic: VSS:E21
---

As a Bambu owner, I want to send a sliced `.gcode.3mf` over FTPS and start it with the filaments mapped to my AMS slots in a dialog with a sensible default, so that a multi-colour print starts with the right trays.

## Acceptance criteria

- [ ] FTPS upload tests against a local implicit-TLS FTP server: progress, abort, resume refusal, wrong access code gives `PrinterError.auth`
- [ ] `ams_mapping` built from fixture `.gcode.3mf` plates matches the shape Orca sends (`bambu-connectivity.md` section 1), checked field by field against the H2C's accepted command
- [ ] The send dialog defaults the mapping by type and colour, lets the user change it and sets the send options (timelapse, bed levelling, flow calibration, use AMS)
- [ ] `print.project_file` start is asserted against the fake broker; a file sliced in Bambu Studio or Orca is used until E27 exists
- [ ] On the H2C: a two-colour `.gcode.3mf` is sent with a user-confirmed mapping and the printer reports the mapped trays in use (US14)

## Out of scope

- Slicing in VSSlicer (E27); queued sending (US31).
