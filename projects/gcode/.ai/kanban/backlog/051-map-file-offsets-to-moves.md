---
id: 51
title: Map file offsets to moves
type: feature
priority: P1
effort: M
model: sonnet
area: [live]
story: US17
milestone: "VSS:M1"
depends_on: [50, 5]
created: 2026-10-25
---

Binary search over E3's file offsets as Fluidd and Mainsail do.

## Acceptance criteria

- [ ] Tests: offset inside a line, on a layer boundary, past the end (clamped with a warning)
- [ ] `.bgcode`: offsets are mapped for whichever the printer reports (decoded stream or binary file), documented

## Tasks

- [ ] Binary search
- [ ] Clamp and warn
- [ ] `.bgcode` mapping

## Progress

Not started.
