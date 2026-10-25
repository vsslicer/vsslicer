---
id: 209
title: Add the history methods and topic to the printer protocol
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon, history]
story: US54
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [168]
created: 2026-10-25
---

`history.query`, `history.backfill` and the `history.changed` topic, namespaced so they do not clash with the upload `queue.*` methods.

**Code:** `vsslicer/modules/printer-agent/src/domain/...` (module: `printer-agent`, layer: `domain`)

## Acceptance criteria

- [ ] Schemas and regenerated JSON Schema checked in; property tests reject invalid params

## Tasks

- [ ] Schemas
- [ ] Property tests

## Progress

Not started.
