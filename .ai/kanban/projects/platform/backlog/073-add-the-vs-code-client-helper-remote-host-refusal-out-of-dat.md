---
id: 73
title: "Add the VS Code client helper: remote-host refusal, out-of-date message and restart action"
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US42
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [60, 67, 14]
created: 2026-10-25
---

The only VS Code API use in the module: `createAgentClient(context, options)` refuses to run in a remote extension host with a clear message and turns `AgentVersionMismatch` into "VSSlicer agent is out of date: restart it" with a Restart action that sends `shutdown` and reconnects via spawn. `vscode` is a peer dependency.

**Code:** `vsslicer/modules/agent-protocol/src/presentation/...` (module: `agent-protocol`, layer: `presentation`)

## Acceptance criteria

- [ ] With `vscode.env.remoteName` set (stubbed) the helper throws a named error and shows the message; nothing connects
- [ ] On `AgentVersionMismatch` the notification text and the `Restart` action appear; choosing it restarts the daemon and reconnects (reference server with a deliberately higher major, integration test)
- [ ] The domain and application layers still import no `vscode` (lint passes)

## Tasks

- [ ] Implement the helper
- [ ] Unit tests with a stubbed `vscode`
- [ ] Integration test in the sample extension (needs the test-electron harness)

## Progress

Not started.
