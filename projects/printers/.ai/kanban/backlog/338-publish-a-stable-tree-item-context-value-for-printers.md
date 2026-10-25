---
id: 338
title: Publish a stable tree-item context value for printers
type: feature
priority: P1
effort: XS
model: sonnet
area: [api]
story: US42
milestone: "VSS:M4"
depends_on: [28]
created: 2026-10-25
---

Sets `contextValue` on printer tree items to a documented constant list (`vsslicer.printer`, plus `.hasCamera` when a camera exists) so other extensions can contribute an 'Open camera' menu.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A stub extension contributes a `view/item/context` entry on `viewItem =~ /vsslicer\.printer/` and it shows in the Printers tree
- [ ] The constants are exported and listed in the README; an existing menu keeps working

## Tasks

- [ ] Set the context values
- [ ] Export constants
- [ ] Stub test

## Progress

Not started.
