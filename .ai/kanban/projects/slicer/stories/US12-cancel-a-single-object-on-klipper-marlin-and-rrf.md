---
id: US12
title: "Cancel a single object on Klipper, Marlin and RRF"
status: reviewed
epic: VSS:E27
---

As a user printing several objects, I want object labels and exclude-object commands in the G-code, so that I can cancel one failed object without losing the plate.

## Acceptance criteria

- [ ] `gcode_label_objects` and `exclude_object` are enabled in the emitted preset when the firmware flavour supports them
- [ ] Labelled output carries one label per object instance, matched to the objects, for Klipper (with `EXCLUDE_OBJECT_DEFINE`), Marlin and RRF fixtures, checked by `@vsslicer/gcode`'s label reader
- [ ] A flavour without support leaves the preset unchanged and says so

## Out of scope

- The cancel-object UI (PRN)
