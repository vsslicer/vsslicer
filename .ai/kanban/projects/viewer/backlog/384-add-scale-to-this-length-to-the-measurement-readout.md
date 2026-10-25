---
id: 384
title: Add Scale to this length to the measurement readout
type: feature
priority: P2
effort: S
model: sonnet
area: [viewer]
story: US96
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [382, 383]
created: 2026-10-25
---

A button on a distance or diameter readout opens a field for the wanted length (uniform or one axis) and applies it.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/measure/scaleTo.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Entering a length scales the object and the readout shows the new value
- [ ] Disabled with the reason on a locked plate or a read-only file

## Tasks

- [ ] Button and field
- [ ] Harness test

## Progress

Not started.
