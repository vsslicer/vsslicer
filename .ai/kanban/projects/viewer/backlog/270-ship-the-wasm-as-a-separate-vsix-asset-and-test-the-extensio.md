---
id: 270
title: Ship the WASM as a separate VSIX asset and test the extension without it
type: chore
priority: P1
effort: M
model: sonnet
area: [step]
story: US70
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [263, PLT-21]
created: 2026-10-25
---

Packaging rule and test: the VSIX contains the WASM as its own file, outside the bundle; a second run with the file removed starts, edits, saves and reports STEP unavailable.

**Code:** `vsslicer/modules/project-extension/scripts/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] The VSIX content assertion lists the WASM file separately and the bundle contains none of its bytes
- [ ] With the file removed the extension activates, opens a 3MF and reports STEP unavailable
- [ ] Replacing the file with another build works (documented, tested once)

## Tasks

- [ ] Packaging step
- [ ] Content assertion
- [ ] Absent-file test

## Progress

Not started.
