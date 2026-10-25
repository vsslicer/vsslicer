---
id: 10
title: "Write the contract kit: connect, status, subscribe and job gating"
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [8, 9, 7]
created: 2026-10-25
---

The suite every adapter runs against its fixtures: the status and job surface.

**Code:** `vsslicer/modules/printer-api/src/adapters/testing/` (module: `printer-api`, layer: `adapters`)

## Acceptance criteria

- [ ] Checks: connect, status mapping, subscribe/unsubscribe for push and poll adapters, job commands gated by capability, every `PrinterError` kind reaches the caller typed
- [ ] The kit passes for the fake adapter in CI and fails for a deliberately broken fake (meta test)
- [ ] Exported as `@vsslicer/printer-api/testing` with usage docs

## Tasks

- [ ] Write the suite
- [ ] Meta test with a broken fake
- [ ] Docs

## Progress

Not started.
