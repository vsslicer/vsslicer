---
id: US7
title: "Imported filaments carry brand, material, colour variants and slicer ids"
status: reviewed
epic: VSS:E41
---

As a user, I want OFD's brand, material, filament and variant records imported with sizes, EAN and the Bambu, Orca, Prusa and Cura ids, so that a spool created from the catalogue links to the right profile.

## Acceptance criteria

- [ ] Counts of brands, materials, filaments and variants match the pinned snapshot's own index; the Bambu PLA sample carries `slicer_ids.bambu = "GFA16"` and generic `GFL99`
- [ ] Records validate against OFD's JSON Schema (draft-07); invalid records are skipped and listed in a report, never half-imported
- [ ] An unknown OFD major version fails closed
- [ ] The live OFD URL is checked in a non-blocking nightly job

## Out of scope

- Cura fdm_materials, 3D Filament Profiles, Bambu preset files
