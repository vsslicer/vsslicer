---
id: 106
title: Export `Slicer.slice(job)` and `Slicer.capabilities(engine)` and document them
type: feature
priority: P0
effort: M
model: opus
area: [engine]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [102, 92]
created: 2026-10-25
---

The cross-extension contract (PRF's form reads capabilities, PRN and others call slice) via extension `exports`; versioned types come from `slicer-api`.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A stub extension calls `Slicer.slice(job)` with the fake engine and gets progress and staged outputs (`@vscode/test-electron`)
- [ ] `Slicer.capabilities(engine)` returns the validated table
- [ ] README documents both with an example

## Tasks

- [ ] Exports
- [ ] Docs
- [ ] Stub extension test

## Progress

Not started.
