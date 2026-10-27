---
id: 238
title: Integration-test send to many and the Fleet view with fixture printers
type: chore
priority: P2
effort: M
model: sonnet
area: [fleet]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP39"
depends_on: [235, 236, 237, 199]
created: 2026-10-25
---

Fake adapter and Moonraker replay fixtures: send one plate to both, with a mismatch refused.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Both compatible printers start and produce history records; the mismatch is refused with its reason

## Tasks

- [ ] Harness
- [ ] Tests

## Progress

Not started.
