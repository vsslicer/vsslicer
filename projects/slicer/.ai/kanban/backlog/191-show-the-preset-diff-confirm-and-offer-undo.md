---
id: 191
title: "Show the preset diff, confirm and offer undo"
type: feature
priority: P2
effort: M
model: sonnet
area: [tasks, calibration]
story: US47
milestone: "VSS:M5"
sprint: "VSS:SP27"
depends_on: [190]
created: 2026-10-25
---

Shows the diff of the new preset in a VS Code diff editor, asks to confirm and offers an Undo command.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Confirm writes the preset; Cancel writes nothing (test with the fake store)
- [ ] The Undo command is available after a write and disappears after use
- [ ] Shown values include the key name and units

## Tasks

- [ ] Diff view
- [ ] Confirm flow
- [ ] Undo command
- [ ] Tests

## Progress

Not started.
