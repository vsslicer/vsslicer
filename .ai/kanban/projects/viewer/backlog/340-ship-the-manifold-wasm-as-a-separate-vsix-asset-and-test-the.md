---
id: 340
title: Ship the manifold WASM as a separate VSIX asset and test the extension without it
type: chore
priority: P2
effort: M
model: sonnet
area: [editor]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [327, PLT-21, 335]
created: 2026-10-25
---

Packaging rule and test: the VSIX contains the WASM as its own file outside the bundle, and a run with it removed starts, edits, saves and reports cut and boolean unavailable.

**Code:** `vsslicer/modules/project-extension/scripts/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] The VSIX content assertion lists the WASM file separately and the bundle contains none of its bytes
- [ ] With the file removed the extension activates, opens a 3MF and the tools are disabled with a message
- [ ] The WASM is loaded only when a cut or boolean runs (asserted)

## Tasks

- [ ] Packaging step
- [ ] Content assertion
- [ ] Absent-file test

## Progress

Not started.
