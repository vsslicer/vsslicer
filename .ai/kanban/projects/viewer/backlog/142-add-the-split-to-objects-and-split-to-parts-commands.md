---
id: 142
title: Add the split to objects and split to parts commands
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [135, 134, 137]
created: 2026-10-25
---

Splits an object into objects or into parts using the worker. The history stores the operation, not the result meshes; replay recomputes it deterministically.

**Code:** `vsslicer/modules/apps/project/src/application/commands/split/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Two-shell fixture gives two objects (or two parts); undo restores the original object and its mesh reference
- [ ] The log entry is smaller than 1 KB for a 1M-triangle object
- [ ] Replay of the log gives equal results
- [ ] Registered with the command generator of the undo property test

## Tasks

- [ ] Commands
- [ ] Deterministic ordering
- [ ] Tests

## Progress

Not started.
