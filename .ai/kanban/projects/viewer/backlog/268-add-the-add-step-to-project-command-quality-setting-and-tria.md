---
id: 268
title: "Add the Add STEP to project command, quality setting and triangle count preview"
type: feature
priority: P1
effort: M
model: sonnet
area: [step]
story: US68
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [265, 267, 257]
created: 2026-10-25
---

A command with a file picker, a quality choice with the previewed triangle count, and an objects-or-parts choice.

**Code:** `vsslicer/modules/project-extension/src/presentation/step/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Changing quality updates the previewed count
- [ ] The chosen options reach the command
- [ ] The command is hidden when STEP is unavailable

## Tasks

- [ ] Command
- [ ] Quality UI
- [ ] Test host test

## Progress

Not started.
