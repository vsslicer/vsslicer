---
id: 64
title: Integration-test the inventory flows end to end
type: chore
priority: P1
effort: S
model: sonnet
area: [ui]
story: US22
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [52, 53, 55, 56, 57, 63]
created: 2026-10-25
---

One `@vscode/test-electron` suite for add from catalogue, edit, archive, restore, history correction and slot assignment together, with a 2000-spool inventory.

**Code:** `vsslicer/modules/apps/filament/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The suite passes on Linux, macOS and Windows CI
- [ ] Tree refresh with 2000 spools stays under 100 ms in the suite

## Tasks

- [ ] Write the suite
- [ ] CI wiring

## Progress

Not started.
