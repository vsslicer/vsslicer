---
id: US68
title: "See Prusa in the capability matrix and use its native substitutions"
status: reviewed
epic: VSS:E65
---

As a user, I want the Prusa engine marked per setting like the others and its own substitutions respected, so that nothing is ignored or applied twice.

## Acceptance criteria

- [ ] The Prusa column of the capability table is hand-maintained for 2.9.x and covers every unified key; effect tests pass against the pinned engine for supported rows (pressure equalizer, ramping travels, regex substitution natively)
- [ ] The built-in regex step is switched off when the Prusa engine applies `gcode_substitutions` itself
- [ ] A committed capability report exists for the pinned version

## Out of scope

