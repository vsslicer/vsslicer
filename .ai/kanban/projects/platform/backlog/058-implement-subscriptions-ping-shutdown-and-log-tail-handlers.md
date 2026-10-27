---
id: 58
title: "Implement subscriptions, `ping`, `shutdown` and `log.tail` handlers"
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US47
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [55, 56]
created: 2026-10-25
---

Topic broker with per-topic sequence numbers per subscriber, plus the `ping`, `shutdown` and `log.tail` handlers. `log.tail` takes a log-source function the host supplies.

**Code:** `vsslicer/modules/common/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] Notifications reach only subscribed connections, in order, with `seq` starting at 1 per topic; `unsubscribe` and connection close remove subscriptions
- [ ] `ping` echoes; `shutdown` invokes the host's shutdown callback once and replies before closing
- [ ] `log.tail` returns the last N lines from the supplied source and, with `follow`, emits lines as notifications until unsubscribed; N is capped

## Tasks

- [ ] Implement the broker
- [ ] Implement the three handlers
- [ ] Unit tests with fake connections

## Progress

Not started.
