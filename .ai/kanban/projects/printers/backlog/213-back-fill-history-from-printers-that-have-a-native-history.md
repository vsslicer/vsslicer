---
id: 213
title: Back-fill history from printers that have a native history
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon, history]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [211, 190, 194]
created: 2026-10-25
---

`history.backfill` pages `session.history.list`, merges through job-history and reports counts.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] With the fake adapter: second run adds zero; a printer without the flag returns a clear 'not supported'

## Tasks

- [ ] Method
- [ ] Tests

## Progress

Not started.
