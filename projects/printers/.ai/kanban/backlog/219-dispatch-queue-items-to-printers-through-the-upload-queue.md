---
id: 219
title: Dispatch queue items to printers through the upload queue
type: feature
priority: P2
effort: L
model: opus
area: [daemon, fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [217, 218, 208, 168]
created: 2026-10-25
---

The dispatch loop: choose a compatible idle printer, require confirmation for `any`, upload through the existing upload queue, start the job, link the history id.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Wrong-dispatch guards each tested: blocked items never start, `any` without confirmation never starts
- [ ] An item dispatches exactly once with two clients connected
- [ ] Upload failure sets the item `failed` with the reason

## Tasks

- [ ] Loop
- [ ] Guards
- [ ] Tests

## Progress

Not started.
