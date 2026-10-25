---
id: US27
title: "Link a spool to a material profile"
status: reviewed
epic: VSS:E43
---

As a user who slices, I want each spool linked to a material profile through the filament's `slicer_ids`, so that slicing and printing can pick the right material.

## Acceptance criteria

- [ ] OFD Bambu PLA Basic links to the `GFA00` material; generic `GFL99` asks the user; several or no matches ask the user
- [ ] Profile fixtures imported from Orca, Bambu, PrusaSlicer and Cura resolve by each of the four id kinds
- [ ] With the profiles extension disabled the view shows "Install VSSlicer Profiles" and leaves the link empty
- [ ] `materialFor(spoolId)` is exported for SLC and PRN

## Out of scope

- Writing material profiles
