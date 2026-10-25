---
id: US14
title: "Use the right extruder for support and adhesion on a two-extruder Cura printer"
status: reviewed
epic: VSS:E28
---

As a Cura user with two extruders, I want support and adhesion settings to come from the extruder `limit_to_extruder` names, so that support layers print with the right temperature and material.

## Acceptance criteria

- [ ] A two-extruder fixture resolves per-extruder settings and `limit_to_extruder` correctly
- [ ] Regression: support and adhesion settings come from the limited extruder (the wrong extruder's temperature in support layers fails the test)
- [ ] Verified only on fixtures: the H2C is not a Cura target (D5)

## Out of scope

- Painted multi-material UV input
