---
id: US44
title: "Warn about a placeholder the template kind does not provide, without false alarms"
status: reviewed
epic: VSS:E50
---

As a user, I want a warning when I use a placeholder in a template where the slicer will not fill it in (for example `next_extruder` in a layer-change template), and no warnings on the vendor profiles I import, so that I trust the warnings.

## Acceptance criteria

- [ ] A placeholder that the slicer does not provide for the template kind gets a warning that names the kinds that do provide it
- [ ] Unbalanced `{if}`/`{endif}` and unknown variables are diagnosed (the latter as a hint)
- [ ] Running the diagnostics over every G-code template string of the pinned Orca/Bambu and Prusa vendor packs produces zero placeholder warnings

## Out of scope

- Fixing templates automatically; linting G-code commands (that is the G-code language's job).
