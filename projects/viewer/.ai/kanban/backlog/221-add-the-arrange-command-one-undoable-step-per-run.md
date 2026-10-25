---
id: 221
title: "Add the arrange command: one undoable step per run"
type: feature
priority: P1
effort: M
model: sonnet
area: [arrange]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [219, 220, 174, 103]
created: 2026-10-25
---

Collects footprints of the plate's (or selection's) instances, calls arrange across plates in a worker and applies the poses as one command. The log stores the resulting poses, not the input.

**Code:** `vsslicer/modules/project-extension/src/application/commands/arrange/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] One undo restores all poses and plate moves
- [ ] Locked plates are untouched and the plate invariant checks pass
- [ ] Unplaced items are returned for the report and left in place
- [ ] Cancel changes nothing
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Footprint collection
- [ ] Command
- [ ] Tests

## Progress

Not started.
