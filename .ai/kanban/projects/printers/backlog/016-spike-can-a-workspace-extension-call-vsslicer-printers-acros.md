---
id: 16
title: "Spike: can a workspace extension call vsslicer.printers across extension hosts"
type: spike
priority: P1
effort: M
model: opus
area: [api]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [15, PLT-15]
created: 2026-10-25
---

One-day spike: a workspace-kind extension calling the exports of a UI-kind `vsslicer.printers` under Remote-SSH or a split host.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A note records whether exports cross the boundary and what arguments survive serialisation, tried with `@vscode/test-electron` and a remote check by the owner
- [ ] If exports do not cross, the note decides on commands with serialisable arguments for the public API

## Tasks

- [ ] Write the probe extension
- [ ] Run it local and remote
- [ ] Write the note

## Progress

Not started.
