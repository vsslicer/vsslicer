---
id: 55
title: Track new printer notifications to avoid repeats
type: feature
priority: P1
effort: XS
model: sonnet
area: [api, bambu]
story: US11
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [17]
created: 2026-10-25
---

Decide which `notifications[]` entries are new since the last status.

**Code:** `vsslicer/modules/apps/printers/src/application/...` (module: `printers-extension`, layer: `application`)

## Acceptance criteria

- [ ] A repeated notification code on the same printer is not new; a cleared then returned one is new (unit tests)

## Tasks

- [ ] Tracker
- [ ] Tests

## Progress

Not started.
