---
id: 72
title: Run the agent-protocol conformance suite against the agent
type: chore
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [70, PLT-79]
created: 2026-10-25
---

One command that runs the E19 conformance suite on the real daemon, wired into CI.

**Code:** `vsslicer/modules/printer-agent/` (module: `printer-agent`, layer: `n/a (ci)`)

UNRESOLVED: needs agent-protocol (schema DSL and namespaced registration, AgentServer/AgentClient, conformance suite).

## Acceptance criteria

- [ ] `pnpm conformance` runs the suite against a spawned agent and fails on a deliberately non-conforming build

## Tasks

- [ ] Script
- [ ] CI job

## Progress

Not started.
