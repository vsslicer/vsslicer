---
id: 20
title: Add the Printers tree view with status and progress
type: feature
priority: P1
effort: M
model: sonnet
area: [api]
story: US4
milestone: "VSS:M3"
depends_on: [17, 19]
created: 2026-10-25
---

A tree view of printers with state, progress, temperatures and active notifications.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Printers show state icon, progress and temperatures; active `notifications[]` show with code and severity
- [ ] Updates arrive from status events without polling the tree; a disposed view leaks no listener

## Tasks

- [ ] Tree data provider
- [ ] Item rendering
- [ ] Tests with the fake adapter

## Progress

Not started.
