---
id: US46
title: "Add modifier, negative, support enforcer and support blocker volumes"
status: reviewed
epic: VSS:E33
---

As a user, I want to add modifier, negative-volume, support-enforcer and support-blocker shapes to an object from a primitive or a file, so that I can shape a print locally.

## Acceptance criteria

- [ ] Each volume type can be added, transformed, retyped and removed
- [ ] Each type is written with the subtype the Orca CLI honours (checked in the sliced G-code: a negative volume cuts, a blocker removes supports, a modifier changes infill)
- [ ] Volumes are shown under their object in the tree with their type
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Painted supports (E52)
