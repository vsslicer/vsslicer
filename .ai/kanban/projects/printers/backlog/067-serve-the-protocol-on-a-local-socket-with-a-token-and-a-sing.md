---
id: 67
title: Serve the protocol on a local socket with a token and a single-instance lock
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [63, 65, PLT-72]
created: 2026-10-25
---

Wire `AgentServer`: Unix socket or named pipe in the user runtime dir, random token in a 0600 file, lock file, version handshake.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] Two simultaneous starts end with one server; a client without the token is refused and closed
- [ ] POSIX permissions test: socket and token file are not readable by another user (Windows pipe ACL checked manually)
- [ ] Socket name includes the product name

## Tasks

- [ ] Socket and lock
- [ ] Token file
- [ ] Handshake wiring

## Progress

Not started.
