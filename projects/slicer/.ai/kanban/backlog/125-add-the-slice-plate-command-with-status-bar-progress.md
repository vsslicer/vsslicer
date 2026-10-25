---
id: 125
title: "Add the 'Slice plate' command with status bar progress"
type: feature
priority: P1
effort: M
model: sonnet
area: [tasks]
story: US24
milestone: "VSS:M3"
depends_on: [111, 105]
created: 2026-10-25
---

A command that slices the active project plate with `withProgress` in the status bar, cancellable.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The command slices the fixture plate with the fake engine; progress and cancel work (`@vscode/test-electron`)
- [ ] Failure shows one notification naming the step
- [ ] No active project gives a clear message

## Tasks

- [ ] Command
- [ ] withProgress
- [ ] Tests

## Progress

Not started.
