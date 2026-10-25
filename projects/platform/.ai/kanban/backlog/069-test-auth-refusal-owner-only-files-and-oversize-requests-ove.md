---
id: 69
title: "Test: auth refusal, owner-only files and oversize requests over real sockets"
type: chore
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US41
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [63, 56, 66]
created: 2026-10-25
---

End-to-end security tests against the reference server. Path: `vsslicer/modules/agent-protocol/test/integration/security.test.ts` (layer: adapters, test).

**Code:** `vsslicer/modules/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] Wrong and missing token each give `Unauthorized` and the socket is closed by the server
- [ ] Linux and macOS: the socket, directory and token file modes are 0700/0600 and a stale token (after restart) is refused
- [ ] A 2 MB request gets the named oversize error and the server still serves a following valid request

## Tasks

- [ ] Write the tests
- [ ] Run on three operating systems

## Progress

Not started.
