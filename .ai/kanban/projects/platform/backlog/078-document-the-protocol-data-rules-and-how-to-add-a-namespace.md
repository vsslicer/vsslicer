---
id: 78
title: "Document the protocol, data rules and how to add a namespace"
type: docs
priority: P1
effort: S
model: sonnet
area: [agent-protocol]
story: US49
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [77, 75]
created: 2026-10-25
---

The module README and `docs/protocol.md`: methods, error table, handshake, auth, data rules, adding `printer.*` methods, using the test kit and running conformance. Path: `vsslicer/modules/agent-protocol/README.md`.

**Code:** `vsslicer/modules/agent-protocol/` (module: `agent-protocol`, layer: n/a (docs))

## Acceptance criteria

- [ ] States the data rules: no bulk binary over RPC, files by local path, camera frames via the loopback HTTP proxy with a per-session token
- [ ] A worked example of adding a method in a namespace compiles (the snippet is a test)
- [ ] Links the error table to the pinned test and the schema file

## Tasks

- [ ] Write README and protocol.md
- [ ] Make the example snippet a test

## Progress

Not started.
