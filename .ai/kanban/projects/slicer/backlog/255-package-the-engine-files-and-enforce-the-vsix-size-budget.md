---
id: 255
title: Package the engine files and enforce the VSIX size budget
type: chore
priority: P2
effort: M
model: sonnet
area: [embedded]
story: US74
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [253, PLT-21, PLT-22]
created: 2026-10-25
---

Packages the engine as the decision says (inside `vsslicer.slicer`, or a separate `vsslicer.engine-*` VSIX) and fails the build over the budget; the extension must work without the files.

**Code:** `vsslicer/modules/slicer/embedded/` (module: `slicer-embedded`, layer: n/a (ci))

## Acceptance criteria

- [ ] The VSIX content assertion lists the engine files and the size is under the budget set in the decision
- [ ] The extension runs and falls back with a clear message when the engine files are absent (test)
- [ ] Per-platform packaging works when the decision needs it

## Tasks

- [ ] Packaging
- [ ] Size budget
- [ ] Absent-files test

## Progress

Not started.
