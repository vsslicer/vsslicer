---
id: US21
title: "Let other extensions read the project and render plate images"
status: reviewed
epic: VSS:E10
---

As the author of sliced output or printer sends, I want a read-only `ProjectModel` and `renderThumbnail(plate)`, so that I can reference plates and ship a thumbnail without building my own renderer.

## Acceptance criteria

- [ ] `ProjectModel` is exported with plates, objects, per-plate sliced artefacts and change events (read-only; editable from E32)
- [ ] `renderThumbnail(plate)` renders a plate image offscreen in the webview and returns PNG bytes
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything outside this story's epic
