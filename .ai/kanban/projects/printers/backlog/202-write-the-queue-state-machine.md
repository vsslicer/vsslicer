---
id: 202
title: Write the queue state machine
type: feature
priority: P2
effort: M
model: sonnet
area: [fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [201]
created: 2026-10-25
---

States `ready, starting, paused, done, failed, cancelled` and the transitions with reasons.

**Code:** `vsslicer/modules/fleet-queue/src/domain/...` (module: `fleet-queue`, layer: `domain`)

## Acceptance criteria

- [ ] Every transition tested; illegal ones rejected
- [ ] `starting` found after a restart becomes `failed` with a reason or `ready` again by an explicit rule, never dropped (test)

## Tasks

- [ ] Transitions
- [ ] Restart rule
- [ ] Tests

## Progress

Not started.
