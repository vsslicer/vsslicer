---
id: 63
title: Implement the `vscode-jsonrpc` socket and pipe transport with the 1 MB cap
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US41
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [55, 59, 62]
created: 2026-10-25
---

Implements the server `Connection` and client `Transport` ports over `vscode-jsonrpc` on a Unix socket or named pipe. No TCP.

**Code:** `vsslicer/modules/common/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] Server and client round-trip a request over a real socket (Linux, macOS) and pipe (Windows) in CI
- [ ] A message larger than 1 MB is refused before JSON parsing with a named error and the connection stays usable for the next valid request (2 MB test)
- [ ] A test enumerates the server's listening handles and finds no TCP listener

## Tasks

- [ ] Implement server listener and client connector
- [ ] Implement the byte cap in the message reader
- [ ] Tests on three operating systems

## Progress

Not started.
