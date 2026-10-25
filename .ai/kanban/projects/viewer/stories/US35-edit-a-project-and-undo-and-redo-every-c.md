---
id: US35
title: "Edit a project and undo and redo every change"
status: reviewed
epic: VSS:E32
---

As a user who opened a project, I want every edit to be a step that VS Code's undo and redo stack can reverse and repeat, with the dirty marker, so that I can try changes without fear.

## Acceptance criteria

- [ ] Property test: any random sequence of commands followed by the same number of undos returns a model equal to the start; redo returns to the end
- [ ] Commands group into one undo step; each step fires one `CustomDocumentEditEvent`; no mesh snapshots are kept
- [ ] The webview sends commands, never state; after a reload it replays the model from the host
- [ ] A starter command set (rename object, delete object, set object transform) is undoable through VS Code's stack
- [ ] The setting `vsslicer.project.editing` (default on) returns to read-only viewing when off, after asking the user to save unsaved edits first
- [ ] Verified only on fixtures and in the VS Code test host (D5)

## Out of scope

- The editing tools (E33 to E37)
