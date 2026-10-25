---
id: 155
title: "Register printer:// only when a printer exists and add the disable setting"
type: feature
priority: P1
effort: S
model: sonnet
area: [storage]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [154]
created: 2026-10-25
---

Provider registration lifecycle.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] No provider before the first printer is added; `vsslicer.printers.fileSystem.enabled` false removes it
- [ ] Test covers add and remove printer

## Tasks

- [ ] Lifecycle
- [ ] Setting
- [ ] Test

## Progress

Not started.
