---
id: 336
title: Export the agent connection handle
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [82, 75]
created: 2026-10-25
---

PRN-75 keeps `AgentClient` private. Exports a handle (socket path or pipe and token, plus the protocol version) so `camera-extension` can talk to the same agent.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A stub extension gets the handle and calls a method on the agent; with `useAgent` off the export returns `undefined`
- [ ] The token is returned only to extensions in the same host and never logged or put in a command argument

## Tasks

- [ ] Add the export
- [ ] Stub extension test

## Progress

Not started.
