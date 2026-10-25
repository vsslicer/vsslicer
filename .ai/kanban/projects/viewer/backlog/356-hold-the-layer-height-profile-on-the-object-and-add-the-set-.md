---
id: 356
title: Hold the layer-height profile on the object and add the set and reset commands
type: feature
priority: P2
effort: M
model: sonnet
area: [editor]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [101, 103, 355, 299]
created: 2026-10-25
---

The object's profile lives in the ProjectModel (read from `layer_heights_profile.txt` or the Prusa part, written on save). `setProfile` and `resetProfile` are commands; every profile edit builds on them.

**Code:** `vsslicer/modules/project-extension/src/application/commands/layerheight/profile.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Orca and Prusa 2.x fixtures load with their profile; a project without one has none
- [ ] Set then undo restores the profile exactly; reset removes it and undo brings it back
- [ ] A saved and reopened project keeps the profile (file equal)
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Model field
- [ ] Set and reset commands
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
