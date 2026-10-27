---
id: 77
title: Write the conformance suite and its one-command runner
type: feature
priority: P0
effort: M
model: opus
area: [agent-protocol]
story: US49
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [66, 69, 71, 57]
created: 2026-10-25
---

A suite any server implementation must pass, run by E22 against the real daemon. Judgment-heavy: deciding the normative behaviours. Exported as a library and a `pnpm conformance` CLI taking a socket path and token file.

**Code:** `vsslicer/modules/common/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] The suite passes against the reference server; `pnpm conformance --socket <path> --token-file <path>` runs it against an external server
- [ ] It covers handshake, auth refusal, version mismatch, validation, size cap, cancellation, subscribe with sequence numbers, ping and shutdown
- [ ] Meta-test: a server with one behaviour broken (no token check; no size cap; duplicate seq) fails the matching case

## Tasks

- [ ] Write the suite as a library
- [ ] Write the CLI
- [ ] Write the meta-tests with deliberately broken servers

## Progress

Not started.
