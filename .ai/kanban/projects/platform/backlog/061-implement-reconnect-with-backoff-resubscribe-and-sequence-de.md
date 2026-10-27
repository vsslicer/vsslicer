---
id: 61
title: "Implement reconnect with backoff, resubscribe and sequence de-duplication"
type: feature
priority: P0
effort: M
model: opus
area: [agent-protocol]
story: US45
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [60]
created: 2026-10-25
---

Keeps subscriptions alive across a daemon restart: bounded exponential backoff, resubscribe of every topic after reconnect and re-handshake, and dropping notifications whose `seq` was already seen.

**Code:** `vsslicer/modules/common/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] After a drop the client emits `disconnected`, retries with bounded backoff (fake-clock test of the delay sequence), re-handshakes and resubscribes all topics
- [ ] A repeated or older `seq` for a topic is dropped; after a server restart (seq back to 1 with a new server instance id from `initialize`) the counter resets and notifications flow
- [ ] `close()` stops retries and rejects pending work; version mismatch or `Unauthorized` on reconnect stops retrying and emits the error

## Tasks

- [ ] Implement backoff and the resubscribe set
- [ ] Implement seq tracking keyed by server instance id
- [ ] Unit tests

## Progress

Not started.
