---
id: 56
title: "Show a spool's history with flags and the measure, correct and reassign actions"
type: feature
priority: P1
effort: M
model: sonnet
area: [ui]
story: US25
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [52, 48, 46]
created: 2026-10-25
---

Per-spool history as child nodes or a panel: source, job, printer, estimate and disagreement flags; actions to measure on a scale, correct and reassign to another spool.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] History lists the events of an E42 fixture with source, job, printer, estimate and flag
- [ ] A scale correction clears the flag; reassigning moves the event to the chosen spool (integration test)

## Tasks

- [ ] History nodes
- [ ] Actions
- [ ] Integration test

## Progress

Not started.
