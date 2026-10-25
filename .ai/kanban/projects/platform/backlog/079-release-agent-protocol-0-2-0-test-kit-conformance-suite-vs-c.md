---
id: 79
title: "Release `agent-protocol@0.2.0`: test kit, conformance suite, VS Code client helper"
type: chore
priority: P0
effort: XS
model: sonnet
area: [agent-protocol]
story: US49
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [72, 73, 74, 75, 76, 77, 78]
created: 2026-10-25
---

The increment UI extensions (`vsslicer.printers`, `.bambu`, `.camera`, `.fleet`) and E22's CI need: the VS Code helper under `/vscode`, the test kit under `/testkit`, and the conformance suite and CLI. Builds on 0.1.0 without breaking it.

**Code:** `vsslicer/modules/agent-protocol/` (module: `agent-protocol`, layer: n/a (release))

## Acceptance criteria

- [ ] `CHANGELOG.md` lists the contents; version 0.2.0; published to the local registry
- [ ] A clean consumer installs `^0.2.0`, imports `/testkit` and `/vscode`, and runs `conformance` against the reference server

## Tasks

- [ ] Write changelog and bump
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
