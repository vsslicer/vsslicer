---
id: 76
title: "Integration test: sample extension uses the fake daemon in `@vscode/test-electron`"
type: chore
priority: P1
effort: S
model: sonnet
area: [agent-protocol]
story: US48
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [75, 73, 15]
created: 2026-10-25
---

Proves the test kit works inside a real extension host. Path: `vsslicer/modules/agent-protocol/test/integration/extension/` (layer: presentation, test).

**Code:** `vsslicer/modules/agent-protocol/src/presentation/...` (module: `agent-protocol`, layer: `presentation`)

## Acceptance criteria

- [ ] A sample extension's test-electron test issues a request and a subscribe through the fake daemon and sees the scripted notification
- [ ] No socket, no child process is created during the test (asserted)

## Tasks

- [ ] Write the test
- [ ] Add it to the CI job

## Progress

Not started.
