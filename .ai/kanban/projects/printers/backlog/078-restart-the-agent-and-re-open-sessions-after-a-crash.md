---
id: 78
title: Restart the agent and re-open sessions after a crash
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US17
milestone: "VSS:M3"
sprint: "VSS:SP30"
depends_on: [75]
created: 2026-10-25
---

On connection loss the client restarts the agent, re-subscribes and re-opens sessions; the tree shows a reconnected state.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Kill the agent: sessions re-open, tree shows 'reconnected', no unhandled error

## Tasks

- [ ] Restart logic
- [ ] Tree state
- [ ] Test

## Progress

Not started.
