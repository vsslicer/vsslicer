---
id: US58
title: "Print objects one at a time and see collisions named"
status: reviewed
epic: VSS:E64
---

As a user printing many small parts, I want sequential printing to pass through and collisions to be reported by object name, so that I know what to move.

## Acceptance criteria

- [ ] Sequential printing (`print_sequence`, `complete_objects`, Cura `one_at_a_time`) passes through on Orca and Cura; the parser sees objects printed one after another in the set order (effect test)
- [ ] A colliding fixture produces a message naming both objects; the Orca `CLI_VALIDATE_ERROR` and the Cura height or collision result are mapped
- [ ] Height errors are named the same way

## Out of scope

- The collision display in the editor (VWR)
