---
id: US20
title: "Run my existing Prusa and Orca post-processing scripts unchanged"
status: reviewed
epic: VSS:E29
---

As a power user, I want my post-processing scripts to run after slicing with the same environment Orca gives them, so that scripts written for Orca or Prusa keep working.

## Acceptance criteria

- [ ] Each script from the profile's `post_process` list (stripped from the preset in US8) or a workspace setting runs in order on a temp copy of the G-code, with the G-code path as last argument, `SLIC3R_PP_OUTPUT_NAME`, `SLIC3R_PP_HOST` and every config key as `SLIC3R_<KEY>`
- [ ] Environment snapshot test: the set and values of `SLIC3R_*` match those Orca sets for the same preset (oracle: a recording from the pinned Orca running a fixture script that dumps its environment)
- [ ] Interpreters are resolved by extension as Orca does (`.py`, `.ps1`, `.bat`, executables), tested on the Windows runner
- [ ] Scripts run before `.gcode.3mf` assembly so the archive carries the processed G-code and the right MD5
- [ ] Prusa 3.0 stubbed the `SLIC3R_<KEY>` export; we follow Orca's full export and document it

## Out of scope

- Cura `Script` classes
- Regex substitution (E64)
