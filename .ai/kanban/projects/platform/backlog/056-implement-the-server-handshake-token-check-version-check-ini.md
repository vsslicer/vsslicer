---
id: 56
title: "Implement the server handshake: token check, version check, initialize gate"
type: feature
priority: P0
effort: S
model: opus
area: [agent-protocol]
story: US42
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [55]
created: 2026-10-25
---

Security-sensitive: `initialize` is the only method allowed first; it checks the token (constant-time compare), the protocol major, and returns the server version and capabilities.

**Code:** `vsslicer/modules/agent-protocol/src/application/...` (module: `agent-protocol`, layer: `application`)

## Acceptance criteria

- [ ] Missing or wrong token returns `Unauthorized` and asks the connection to close; any other method before `initialize` returns `Unauthorized`
- [ ] Client major greater than server's returns `AgentVersionMismatch` with both versions in `data`; equal major succeeds
- [ ] Token comparison is constant-time (uses `timingSafeEqual`, asserted by a test on equal-length inputs) and the token never appears in logs or error data

## Tasks

- [ ] Implement the initialize gate
- [ ] Implement the constant-time comparison
- [ ] Unit tests

## Progress

Not started.
