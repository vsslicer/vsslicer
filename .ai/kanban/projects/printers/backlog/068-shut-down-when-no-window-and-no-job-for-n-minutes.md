---
id: 68
title: Shut down when no window and no job for N minutes
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US17
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [65]
created: 2026-10-25
---

Idle policy for the agent.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] With a fake clock: shutdown after N minutes with no client and no active job; an active job or a connected client blocks it; N is configurable

## Tasks

- [ ] Policy
- [ ] Fake-clock tests

## Progress

Not started.
