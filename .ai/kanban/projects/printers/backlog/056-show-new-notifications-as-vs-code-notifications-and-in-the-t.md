---
id: 56
title: Show new notifications as VS Code notifications and in the tree item
type: feature
priority: P1
effort: S
model: sonnet
area: [api, bambu]
story: US11
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [55, 20]
created: 2026-10-25
---

Toasts for new HMS-style notifications with severity mapping; the tree item lists active ones.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] New `error` severity raises an error message, warnings a warning; link opens the wiki page
- [ ] Integration test with the fake adapter emitting a notification

## Tasks

- [ ] Toast mapping
- [ ] Tree item
- [ ] Integration test

## Progress

Not started.
