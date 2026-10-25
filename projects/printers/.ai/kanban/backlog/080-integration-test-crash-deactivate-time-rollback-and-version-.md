---
id: 80
title: "Integration-test crash, deactivate time, rollback and version skew"
type: chore
priority: P1
effort: M
model: sonnet
area: [daemon]
story: US17
milestone: "VSS:M3"
depends_on: [76, 77, 78]
created: 2026-10-25
---

The remaining E22 integration criteria.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Crash restart; deactivate under 1 s; `useAgent` off passes the E20 suite; older extension with newer agent negotiates or restarts the agent

## Tasks

- [ ] Crash test
- [ ] Timing test
- [ ] Rollback and skew tests

## Progress

Not started.
