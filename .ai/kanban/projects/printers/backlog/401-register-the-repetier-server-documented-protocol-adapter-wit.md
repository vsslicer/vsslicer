---
id: 401
title: Register the Repetier-Server (documented protocol) adapter with vsslicer.printers
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [381, 400]
created: 2026-10-25
---

On activation registers the `repetier` descriptor with its label and the module path the agent loads, so it appears in the vendor Add printer flow.

**Code:** `vsslicer/modules/printers-unofficial-extension/src/presentation/...` (module: `printers-unofficial-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The adapter appears labelled `Repetier-Server (documented protocol)` in Add printer and in the Printers view; without this extension the host type is reported as not installed
- [ ] Integration test with a stub `vsslicer.printers` checks the descriptor and label

## Tasks

- [ ] Descriptor
- [ ] Label
- [ ] Integration test

## Progress

Not started.
