---
id: 106
title: "Fire CustomDocumentEditEvent per undo step and wire undo, redo and the dirty marker"
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US35
milestone: "VSS:M4"
depends_on: [104]
created: 2026-10-25
---

Each executed step fires `onDidChangeCustomDocument` with undo and redo callbacks into the model, which drives VS Code's stack and the dirty dot.

**Code:** `vsslicer/modules/project-extension/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Ctrl+Z and Ctrl+Y in the test host undo and redo a starter command
- [ ] The dirty marker is set after an edit and cleared after save
- [ ] A grouped step produces one event

## Tasks

- [ ] Event wiring
- [ ] Dirty state
- [ ] Test host test

## Progress

Not started.
