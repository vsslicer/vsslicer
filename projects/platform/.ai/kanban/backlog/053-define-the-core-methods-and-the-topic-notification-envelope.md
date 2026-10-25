---
id: 53
title: Define the core methods and the topic notification envelope
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US47
milestone: "VSS:M3"
depends_on: [52]
created: 2026-10-25
---

Schemas for `initialize`, `shutdown`, `ping`, `subscribe`/`unsubscribe`, `log.tail` and the `topic` notification carrying topic, per-topic sequence number and payload.

**Code:** `vsslicer/modules/agent-protocol/src/domain/...` (module: `agent-protocol`, layer: `domain`)

## Acceptance criteria

- [ ] Every core method has params and result schemas; `initialize` requires `protocolVersion`, `client`, `capabilities` and the auth token, and returns `protocolVersion`, `capabilities` and a per-start `instanceId`
- [ ] The topic notification requires a monotonically usable `seq` integer and a topic name matching `namespace.name`
- [ ] Valid and invalid samples per method are tabled and pass/fail as expected

## Tasks

- [ ] Write the schemas
- [ ] Write the sample tables as test fixtures in `test/fixtures/`

## Progress

Not started.
