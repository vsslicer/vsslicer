---
id: 267
title: Open .step and .stp files in the viewer
type: feature
priority: P1
effort: M
model: sonnet
area: [step]
story: US67
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [264, 54]
created: 2026-10-25
---

Registers the extensions for the viewer, imports with the default quality and shows each solid with its name.

**Code:** `vsslicer/modules/project-extension/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Opening the assembly fixture shows the right number of named solids
- [ ] With STEP unavailable the file opens an explanatory page, not a blank panel

## Tasks

- [ ] Registration
- [ ] Open path
- [ ] Test host test

## Progress

Not started.
