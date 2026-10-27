---
id: 23
title: Show every PrinterError kind to the user
type: feature
priority: P1
effort: M
model: sonnet
area: [api]
story: US5
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [20]
created: 2026-10-25
---

Each error kind gets a notification or a tree item state with an action where one exists.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A table-driven test covers all eight kinds with the fake adapter: `auth` offers re-enter credentials, `unreachable` offers retry
- [ ] No error reaches the user as an unhandled rejection or only in the log

## Tasks

- [ ] Error presenter
- [ ] Tree item states
- [ ] Table test

## Progress

Not started.
