---
id: 117
title: Implement the `slice` task with a pseudoterminal streaming engine progress
type: feature
priority: P1
effort: M
model: opus
area: [tasks]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [115, 111, 116]
created: 2026-10-25
---

`registerTaskProvider` with `CustomExecution`; progress and warning lines are written to the terminal; the task ends with the pipeline's result.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `slice` resolves from `tasks.json` and slices a fixture with the fake engine (`@vscode/test-electron`)
- [ ] Progress lines stream; cancelling the task cancels the pipeline
- [ ] Task exit status reflects failure

## Tasks

- [ ] Provider
- [ ] Pseudoterminal
- [ ] Cancel wiring
- [ ] Test

## Progress

Not started.
