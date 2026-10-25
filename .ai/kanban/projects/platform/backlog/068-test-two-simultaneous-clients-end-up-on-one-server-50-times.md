---
id: 68
title: "Test: two simultaneous clients end up on one server, 50 times"
type: chore
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US46
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [67]
created: 2026-10-25
---

The epic's single-instance acceptance test over the real reference server. Path: `vsslicer/modules/agent-protocol/test/integration/single-instance.test.ts` (layer: adapters, test).

**Code:** `vsslicer/modules/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] Two clients started at the same instant with no daemon end up connected to one server process (same `instanceId` and one server PID), repeated 50 times in CI
- [ ] All spawned servers are killed after each run (no leaked processes)

## Tasks

- [ ] Write the test and the process cleanup helper
- [ ] Run it on three operating systems

## Progress

Not started.
