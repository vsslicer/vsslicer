---
id: US5
title: "Open a Bambu .gcode.3mf by plate"
status: reviewed
epic: VSS:E3
---

As a Bambu Studio or Orca BBL user, I want to open a `.gcode.3mf` and pick a plate, with its statistics and thumbnail, so sliced Bambu projects open without extraction.

## Acceptance criteria

- [ ] Bambu Studio and Orca BBL plate files open by plate with `slice_info.config` statistics and plate thumbnails
- [ ] An MD5 mismatch against `plate_N.gcode.md5` is reported as a diagnostic
- [ ] A `.gcode.3mf` sliced for the H2C in Bambu Studio (version recorded) is in the corpus and opens, including data descriptors or zip64 if present

## Out of scope

- OPC container writing (E8)
