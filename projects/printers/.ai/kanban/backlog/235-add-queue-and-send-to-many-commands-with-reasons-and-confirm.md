---
id: 235
title: Add queue and send-to-many commands with reasons and confirmation
type: feature
priority: P2
effort: M
model: opus
area: [fleet]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [233, 234, 231]
created: 2026-10-25
---

Commands 'Add plate to queue' and 'Send plate to printers': pick printers, show each check result with its reason, confirm for `any`.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Blocked printers are listed with their reason and cannot be forced
- [ ] `any` target requires an explicit confirmation (test)
- [ ] One action enqueues one item per selected compatible printer

## Tasks

- [ ] Pickers
- [ ] Result list
- [ ] Confirmation
- [ ] Tests

## Progress

Not started.
