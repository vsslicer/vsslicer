---
id: 214
title: Integration-test history with two windows and a damaged file
type: chore
priority: P1
effort: M
model: sonnet
area: [daemon, history]
story: US54
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [211, 212, 213]
created: 2026-10-25
---

Two protocol clients send to two fixture printers; the file stays whole.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Two-window test: both windows' sends land in one file, no partial lines
- [ ] A damaged line in the month file does not stop appends or reads

## Tasks

- [ ] Harness
- [ ] Tests

## Progress

Not started.
