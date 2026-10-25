---
id: 50
title: Register the Bambu adapter with vsslicer.printers
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
depends_on: [49, 46, 28]
created: 2026-10-25
---

On activation call `registerAdapter` with the Bambu descriptor, including the module path the agent will load.

**Code:** `vsslicer/modules/bambu-extension/src/presentation/...` (module: `bambu-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the extension installed, 'Add printer' lists Bambu with the `accessCode` scheme; without it the host type is reported as not installed
- [ ] Integration test with a stub `vsslicer.printers` checks the descriptor

## Tasks

- [ ] Activation
- [ ] Descriptor
- [ ] Integration test

## Progress

Not started.
