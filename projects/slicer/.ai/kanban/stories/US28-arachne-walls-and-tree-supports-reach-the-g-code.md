---
id: US28
title: "Arachne walls and tree supports reach the G-code"
status: reviewed
epic: VSS:E30
---

As a user, I want the wall generator and support type settings to change the output on every engine that supports them, so that the P0 features are real and not just listed.

## Acceptance criteria

- [ ] Arachne variable-width walls (P0): the table has an entry for both engines; effect test: varying extrusion widths in walls
- [ ] Tree and organic supports (P0): entries for both engines; effect: support role present with the tree pattern's layer footprint differing from normal supports (coarse per-layer footprint statistics, no image comparison)
- [ ] Each test names the regression it catches (feature dropped by emission or an engine upgrade)

## Out of scope

- Image comparison
