---
id: US18
title: "Disagreeing sources are flagged and a scale reading corrects them"
status: reviewed
epic: VSS:E42
---

As a user, I want two sources that disagree on a job to be flagged rather than hidden, and manual entries and scale readings to override as corrections, so that I can trust or fix the numbers.

## Acceptance criteria

- [ ] Trust order Moonraker, then Bambu `used_g`, then the slicer total; observations from the other sources are kept
- [ ] Sources differing by more than max(5 g, 10 percent) (settings) flag the event; flags are listed through `Inventory`
- [ ] Manual entry and scale readings always override as correction events and clear the flag
- [ ] Commands "Enter usage manually" and "Measure spool on scale" exist

## Out of scope

- Flag UI (E43)
