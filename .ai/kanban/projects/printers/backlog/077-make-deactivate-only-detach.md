---
id: 77
title: Make deactivate only detach
type: feature
priority: P1
effort: XS
model: sonnet
area: [daemon]
story: US17
milestone: "VSS:M3"
sprint: "VSS:SP30"
depends_on: [75]
created: 2026-10-25
---

`deactivate()` closes the client without stopping sessions.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `deactivate` completes in under 1 s with an active session (timed in the integration test)

## Tasks

- [ ] Detach
- [ ] Timed test

## Progress

Not started.
