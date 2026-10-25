---
id: US52
title: "Edit the wipe tower type, position and ramming"
status: reviewed
epic: VSS:E63
---

As a multi-material user, I want to edit the wipe or prime tower on the plate, so that the tower sits where I want it.

## Acceptance criteria

- [ ] The multi-material panel edits `wipe_tower_type` (Type 1, Type 2), position, size and ramming settings and writes them through ProfileStore and the project model
- [ ] The tower can be dragged in the plate view through the project overlay API; until that API exists, placement is numeric
- [ ] The tower role's bounding box in the parsed G-code is within 1 mm of the placed position (Orca)
- [ ] Settings are scoped per plate and shown with their source

## Out of scope

- The engine's tower generation
