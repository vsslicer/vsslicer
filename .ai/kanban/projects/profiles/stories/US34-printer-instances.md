---
id: US34
title: "A user creates, edits and deletes their own printers as printer instances"
status: reviewed
epic: VSS:E16
---

A user records their printer as an instance (model, nozzle per toolhead, surface, feeder, connection) that the slicer resolves profiles for and the printer extensions connect through.

## Acceptance criteria

- [ ] Instances validate against the schema; the host type is checked against the static list (bambu-lan, moonraker, octoprint, prusalink, duet); unknown types are rejected
- [ ] Toolhead slots and nozzles resolve per extruder for an H2C dual-nozzle fixture
- [ ] Create, edit and delete work from the tree and form; a deleted instance deletes its secret
- [ ] E16 does not wait for the printer API epic: E20 later reads instances from here

## Out of scope

- Talking to printers (PRN); discovery (E23); the wizard (E17).
