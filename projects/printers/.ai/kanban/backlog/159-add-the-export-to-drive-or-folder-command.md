---
id: 159
title: Add the Export to drive or folder command
type: feature
priority: P0
effort: M
model: sonnet
area: [storage]
story: US26
milestone: "VSS:M3"
depends_on: [136, 17]
created: 2026-10-25
---

Register the folder adapter and add the command: pick volume or folder, preview the sanitised name, write, show the eject hint.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Exporting to a temp folder works end to end in `@vscode/test-electron`; the final name shown is the one written
- [ ] After export on a removable volume an 'eject the card' hint appears
- [ ] Volume list comes from the folder module

## Tasks

- [ ] Adapter registration
- [ ] Command and pickers
- [ ] Integration test

## Progress

Not started.
