---
id: 233
title: "Add the Fleet client, the Fleet tree and the queue items"
type: feature
priority: P2
effort: M
model: sonnet
area: [fleet]
story: US59
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [223]
created: 2026-10-25
---

A Fleet view with each printer's state and its queued items, with cancel, retry and reorder.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Tree shows states and items from a fixture agent; actions call the fleet methods
- [ ] Updates arrive from the topic in two windows

## Tasks

- [ ] Client
- [ ] Tree
- [ ] Actions

## Progress

Not started.
