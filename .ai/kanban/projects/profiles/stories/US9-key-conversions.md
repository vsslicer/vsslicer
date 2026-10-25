---
id: US9
title: "The 56 mapped keys convert both ways between slicer dialects"
status: reviewed
epic: VSS:E11
---

A developer exporting or importing a profile gets correct values for the 56 keys of the `profiles.md` §6 table in every direction, including the lossy cases flagged.

## Acceptance criteria

- [ ] All 56 keys convert native to unified and back with unit tests; 90-x support angle, Cura flow x100, elephant-foot sign flip and per-plate bed temperatures are covered
- [ ] A lossy conversion is flagged with its reason; a percent value stays relative
- [ ] An unknown enum value returns a diagnostic, not a guess

## Out of scope

- Keys beyond the 56 beyond their catalogue-declared conversions.
