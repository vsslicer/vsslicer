---
id: 72
title: "Release `agent-protocol@0.1.0`: schema, core methods, AgentServer, AgentClient, authenticated socket transport, reference server"
type: chore
priority: P0
effort: XS
model: sonnet
area: [agent-protocol]
story: US49
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [20, 54, 64, 68, 69, 70, 71, 57]
created: 2026-10-25
---

The increment E22 (daemon) needs: the server half and transport. Contains the TypeBox DSL, error model, committed JSON Schema, core methods, `AgentServer`, `AgentClient` (request, cancel, reconnect, connect-or-spawn), owner-only socket/pipe with token auth, single-instance lock and the reference server. Does not contain the test kit, conformance suite or VS Code helpers (0.2.0).

**Code:** `vsslicer/modules/agent-protocol/` (module: `agent-protocol`, layer: n/a (release))

## Acceptance criteria

- [ ] `CHANGELOG.md` lists the contents; version is 0.1.0; `run.mjs publish` puts it in the local registry and re-publishing skips it
- [ ] A clean consumer project installs `@vsslicer/agent-protocol@^0.1.0` and connects to the reference server (smoke test)

## Tasks

- [ ] Write changelog and bump
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
