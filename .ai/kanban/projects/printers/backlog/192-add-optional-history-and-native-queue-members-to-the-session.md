---
id: 192
title: Add optional history and native queue members to the Session port and contract kit
type: feature
priority: P2
effort: M
model: sonnet
area: [api]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [191]
created: 2026-10-25
---

`session.history?.list({since, limit})`, `session.nativeQueue?.{list, enqueue, remove, start, pause, jump, subscribe}`, and contract-kit checks that run only for adapters that declare the flag.

**Code:** `vsslicer/modules/printer-api/src/application/...` (module: `printer-api`, layer: `application`)

## Acceptance criteria

- [ ] The Marlin-shaped type test still compiles; an adapter declaring `nativeQueue` without the member fails to compile
- [ ] The contract kit skips the checks for adapters without the flag

## Tasks

- [ ] Port members
- [ ] Kit checks
- [ ] Type tests

## Progress

Not started.
