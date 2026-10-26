---
id: 127
title: Register the four open adapters in vsslicer.printers
type: feature
priority: P0
effort: M
model: sonnet
area: [moonraker, octoprint, prusalink, duet]
story: US25
milestone: "VSS:M3"
sprint: "VSS:SP29"
depends_on: [93, 103, 111, 119, 75]
created: 2026-10-25
---

Bundle Moonraker, OctoPrint, PrusaLink and Duet and register them with the registry and the agent loader.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each family appears in 'Add printer' with its declared auth scheme; sessions run in the agent
- [ ] VSIX content assertion updated; size budget respected

## Tasks

- [ ] Register adapters
- [ ] Loader descriptors
- [ ] VSIX check

## Progress

Not started.
