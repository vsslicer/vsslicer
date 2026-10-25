---
id: US36
title: "Save, Save As and revert my project"
status: reviewed
epic: VSS:E32
---

As a user editing a project, I want Save, Save As and Revert to work like in any editor, even when the project panel is hidden, and to be told what the save changed, so that I trust what is on disk.

## Acceptance criteria

- [ ] Save and Save As write through the 3MF writer; Revert reloads the saved file and drops the edits
- [ ] Save while the webview is hidden works (the custom editor contract)
- [ ] The save notice lists removed stale plate artefacts and known interop limits
- [ ] Verified only on fixtures and in the VS Code test host (D5)

## Out of scope

- The conversion dialog for foreign dialects (US33)
