---
id: 382
title: "Test the opt-in, label and consent behaviour end to end"
type: chore
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US73
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [381]
created: 2026-10-25
---

Integration test with the stub registry and a fake adapter per label kind.

**Code:** `vsslicer/modules/printers-unofficial-extension/src/presentation/...` (module: `printers-unofficial-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the extension not installed no vendor host type is listed; with it installed they are listed with labels
- [ ] The consent dialog test, the changed-text re-ask and the read-only firmware display are covered
- [ ] AnkerMake and any cloud host type are asserted absent

## Tasks

- [ ] Harness
- [ ] Scenarios

## Progress

Not started.
