---
id: 50
title: "Spike: named pipes, socket paths and ACLs on the Windows runner"
type: spike
priority: P0
effort: M
model: opus
area: [agent-protocol]
story: US41
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [49, 9]
created: 2026-10-25
---

Answers the epic's Windows risk before the transport is built: pipe naming, path length limits, owner-only ACLs and antivirus behaviour with `vscode-jsonrpc`. Verified on the Windows CI runner; no H2C.

**Code:** `vsslicer/modules/common/agent-protocol/` (module: `agent-protocol`, layer: n/a (spike))

## Acceptance criteria

- [ ] A runnable spike opens a `vscode-jsonrpc` pipe server and client on the Windows runner, round-trips a request, and records the pipe name scheme and why
- [ ] The note states how to make the pipe owner-only (ACL or `\\.\pipe\` name with per-user suffix plus security descriptor) with a test that a second user context cannot connect, or why that is not testable in CI
- [ ] The note records Unix socket path length limits (macOS 104, Linux 108) and the fallback when the runtime dir path is too long

## Tasks

- [ ] Write the spike under `docs/spikes/` in the module
- [ ] Run it in CI on windows-latest, macOS and Linux
- [ ] Write the findings and decision into the module docs

## Progress

Not started.
