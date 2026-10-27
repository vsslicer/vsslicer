---
id: 27
title: "Integration-test the tree, add flow and job gating with the fake adapter"
type: chore
priority: P1
effort: M
model: sonnet
area: [api]
story: US5
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [21, 22, 23, 18, PLT-15]
created: 2026-10-25
---

The `@vscode/test-electron` suite that proves the epic's user-visible criteria.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Add a printer with the fake adapter, see status in the tree, secret not in settings or output (grep), job command hidden without the capability, each error kind visible
- [ ] Runs in the integration matrix on three operating systems

## Tasks

- [ ] Write the suite
- [ ] Hook it into the matrix

## Progress

Not started.
