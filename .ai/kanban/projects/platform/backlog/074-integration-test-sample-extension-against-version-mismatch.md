---
id: 74
title: "Integration test: sample extension against version mismatch"
type: chore
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US42
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [73, 66, 15]
created: 2026-10-25
---

An `@vscode/test-electron` test with the sample extension for the version-mismatch criterion. Path: `vsslicer/modules/common/agent-protocol/test/integration/extension/` (layer: presentation, test).

**Code:** `vsslicer/modules/common/agent-protocol/src/presentation/...` (module: `agent-protocol`, layer: `presentation`)

## Acceptance criteria

- [ ] A sample extension using the helper against a reference server one major behind shows the out-of-date message and the restart action; invoking it makes the client connect
- [ ] Runs on three operating systems in the module's CI job

## Tasks

- [ ] Write the sample extension host test
- [ ] Add it to the CI job

## Progress

Not started.
