---
id: 265
title: "Add the Add STEP command: solids as parts or objects"
type: feature
priority: P1
effort: M
model: sonnet
area: [step]
story: US68
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [264, 135, 103]
created: 2026-10-25
---

Adds the solids to the project as separate objects or as parts of one object, using the add commands. The log stores the file path, hash and options; replay re-imports deterministically.

**Code:** `vsslicer/modules/project-extension/src/application/commands/step/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Choosing objects gives one object per solid, choosing parts gives one object with several parts
- [ ] Undo removes everything it added
- [ ] Replay of the log gives an equal model
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Command
- [ ] Replay
- [ ] Tests

## Progress

Not started.
