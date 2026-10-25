---
id: US60
title: "Import Cura intents with their category counts"
status: reviewed
epic: VSS:E57
---

As a Cura user, I want Cura's intent files imported as overrides tagged with their intent, so that the profile library knows engineering, visual, quick and the other intents for my printer, variant and material.

## Acceptance criteria

- [ ] At `Cura@5bea2f8` the 641 files under `resources/intent/` import; the category counts are engineering 242, visual 143, quick 139, solid 70, annealing 27, strong 7, highspeed 6, highspeedsolid 6 (these sum to 640, so the golden test pins and reports the one remaining file by path)
- [ ] Each intent carries the definition, variant, material and quality type it applies to as a condition
- [ ] `process` accepts an `intent` from Cura's eight categories without breaking existing values (schema positive and negative fixtures)

## Out of scope

- Writing intents back to Cura (export); creating user intents.
