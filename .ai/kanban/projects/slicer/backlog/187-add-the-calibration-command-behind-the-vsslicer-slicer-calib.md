---
id: 187
title: Add the Calibration command behind the `vsslicer.slicer.calibration` flag
type: feature
priority: P2
effort: M
model: sonnet
area: [tasks, calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [185, 186, 126, 147, 105]
created: 2026-10-25
---

Contributes the flag `vsslicer.slicer.calibration` and the command "VSSlicer: Calibration" with a quick pick of tests and their parameters; it slices the plan and opens the preview.

**Code:** `vsslicer/modules/apps/slicer/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the flag off the command is hidden; on, it lists tests with parameters and defaults
- [ ] Choosing the temperature tower slices it with the fake engine and opens the preview (`@vscode/test-electron`)
- [ ] A cancelled quick pick or a failed slice leaves no files and shows the error once

## Tasks

- [ ] Flag and command contributions
- [ ] Quick pick flow
- [ ] Slice and open preview
- [ ] Tests

## Progress

Not started.
