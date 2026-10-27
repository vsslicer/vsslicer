---
id: 57
title: "Deliver `$/cancelRequest` to the handler's `AbortSignal`"
type: feature
priority: P1
effort: S
model: sonnet
area: [agent-protocol]
story: US44
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [55]
created: 2026-10-25
---

Server side of cancellation: a cancel for an in-flight request aborts its signal and the response becomes `Cancelled`.

**Code:** `vsslicer/modules/common/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] Cancelling an in-flight request aborts the handler's `AbortSignal` and the client-visible result is `Cancelled`
- [ ] Cancelling an unknown or finished request is ignored; per-request state is removed when the request ends (no leak, asserted)
- [ ] A handler that ignores the signal still has its response replaced by `Cancelled` once cancelled

## Tasks

- [ ] Track in-flight requests
- [ ] Wire cancel to abort
- [ ] Unit tests

## Progress

Not started.
