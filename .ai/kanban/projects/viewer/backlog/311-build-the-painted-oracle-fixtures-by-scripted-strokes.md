---
id: 311
title: Build the painted oracle fixtures by scripted strokes
type: chore
priority: P2
effort: S
model: sonnet
area: [editor, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [301, 302]
created: 2026-10-25
---

A script paints a plate-sized box and an overhang model through the commands (supports on one overhang, a blocker on another, a seam mark on a corner, two colours on two halves) and saves the projects.

**Code:** `vsslicer/modules/project-extension/test/fixtures/paint-oracle/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] The script rebuilds the same files from the commands (deterministic)
- [ ] Each project holds the painted regions in known positions listed in a README
- [ ] Files open in the viewer

## Tasks

- [ ] Script
- [ ] Positions README

## Progress

Not started.
