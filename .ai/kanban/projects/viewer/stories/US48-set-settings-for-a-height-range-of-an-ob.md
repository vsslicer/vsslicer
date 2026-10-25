---
id: US48
title: "Set settings for a height range of an object"
status: reviewed
epic: VSS:E33
---

As a user, I want to give a layer range of an object its own settings by entering the heights, so that the top of a part prints with different infill or speed.

## Acceptance criteria

- [ ] Range entries (from, to, overrides) are added, edited and removed with numeric heights; ranges that overlap are refused with the reason
- [ ] Entries are written to `layer_config_ranges.xml` and the G-code parser confirms the effect inside the range only
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- The interactive height-range tool and variable layer height (E54)
