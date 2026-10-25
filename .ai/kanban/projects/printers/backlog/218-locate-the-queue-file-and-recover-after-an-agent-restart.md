---
id: 218
title: Locate the queue file and recover after an agent restart
type: feature
priority: P2
effort: S
model: sonnet
area: [daemon, fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [216, 208]
created: 2026-10-25
---

Resolve the project or fleet-root `.vsslicer/queue.json`, open it through the queue store and apply the restart rule.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Restart mid-dispatch test: no item lost, `starting` handled by the rule with a reason

## Tasks

- [ ] Locate
- [ ] Recover
- [ ] Tests

## Progress

Not started.
