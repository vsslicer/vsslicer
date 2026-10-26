---
id: 74
title: Bundle the agent into the printers VSIX
type: chore
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP29"
depends_on: [15, 73, PLT-21]
created: 2026-10-25
---

Ship `vsslicer-agent` inside `vsslicer.printers`.

**Code:** `vsslicer/modules/printers-extension/` (module: `printers-extension`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] The VSIX contains the agent bundle and nothing else new (content assertion updated); size budget respected

## Tasks

- [ ] Bundle step
- [ ] Content assertion

## Progress

Not started.
