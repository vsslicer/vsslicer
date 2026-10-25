---
id: US66
title: "Know when a mesh has problems and be offered a repair"
status: reviewed
epic: VSS:E36
---

As a user, I want a badge on objects whose statistics show open or non-manifold edges and a prompt to repair, so that I fix problems before slicing.

## Acceptance criteria

- [ ] An object with open or non-manifold edges shows a problems badge and offers Repair
- [ ] After a successful repair the badge disappears
- [ ] Verified only on fixtures (D5)

## Out of scope

- Auto-repair without asking beyond the lossless load-time steps
