---
id: 103
title: Build the random command generator and the undo property test
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [102]
created: 2026-10-25
---

Generates random command sequences over fixture projects and checks undo and redo. Every later epic registers its commands with the generator, so a non-invertible command fails here.

**Code:** `vsslicer/modules/apps/project/test/property/` (module: `project-extension`, layer: n/a (tests))

## Acceptance criteria

- [ ] Any random sequence followed by the same number of undos returns a model equal to the start; redo returns to the end
- [ ] A registry hook lets another card add a command type with a payload generator; a command without one fails the test that lists registered types
- [ ] A command with a broken `invert` is caught (meta-test)

## Tasks

- [ ] Generator
- [ ] Property test
- [ ] Registration hook
- [ ] Meta-test

## Progress

Not started.
