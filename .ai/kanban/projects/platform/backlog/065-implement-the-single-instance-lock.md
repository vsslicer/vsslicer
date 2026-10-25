---
id: 65
title: Implement the single-instance lock
type: feature
priority: P0
effort: S
model: opus
area: [agent-protocol]
story: US46
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [62]
created: 2026-10-25
---

A lock in the runtime directory so two windows cannot start two daemons, robust to crashes (stale lock) and races.

**Code:** `vsslicer/modules/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] Two processes racing for the lock: exactly one wins, repeated 200 times in a unit test
- [ ] A lock left by a killed process is detected (PID and start-time or socket liveness check) and taken over; a live holder is never stolen
- [ ] The lock is released on clean shutdown and on SIGTERM/SIGINT

## Tasks

- [ ] Implement acquire/release with an atomic create
- [ ] Implement stale detection
- [ ] Race and crash tests

## Progress

Not started.
