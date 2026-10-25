---
id: 71
title: "Test: killing the server mid-subscription"
type: chore
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US45
milestone: "VSS:M3"
depends_on: [61, 66, 67]
created: 2026-10-25
---

Integration test of the reconnect acceptance criterion. Path: `vsslicer/modules/agent-protocol/test/integration/reconnect.test.ts` (layer: adapters, test).

**Code:** `vsslicer/modules/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] Kill the reference server with SIGKILL during a subscription: the client emits `disconnected`, a restarted server is reconnected to, topics are resubscribed and the next notification arrives exactly once
- [ ] Pending requests at the kill fail with the named disconnect error within the timeout

## Tasks

- [ ] Write the test with a restart helper
- [ ] Run on three operating systems

## Progress

Not started.
