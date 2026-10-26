---
id: 19
title: Persist printer connections in settings
type: feature
priority: P1
effort: S
model: sonnet
area: [api]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [17]
created: 2026-10-25
---

The non-secret connection data (name, adapter id, host, optional instance id) in a settings contribution.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `vsslicer.printers.connections` contributed with a schema; load on activate and save on change
- [ ] Connections survive a reload; a malformed entry is reported once and skipped

## Tasks

- [ ] Settings schema
- [ ] Load and save
- [ ] Tests

## Progress

Not started.
