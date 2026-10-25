---
id: US47
title: "Set per-object, part and modifier settings from the keys allowed there"
status: reviewed
epic: VSS:E33
---

As a user, I want to override print settings on one object, part or modifier and see which keys are allowed at that level and where inherited values come from, so that I can change infill on one object without touching the profile.

## Acceptance criteria

- [ ] The form shows only the keys the schema allows at that level; a refused key states the reason
- [ ] Invalid values show the validation message of the catalogue entry
- [ ] Overrides are written to `model_settings.config` and the sliced G-code shows the effect (for example a different infill density on one object)
- [ ] Each shown value says whether it comes from the profile, the plate or an override
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Per-plate settings (E34)
