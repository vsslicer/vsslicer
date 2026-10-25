---
id: US38
title: "Be asked what to do when the file changes on disk under my edits"
status: reviewed
epic: VSS:E32
---

As a user with unsaved edits, I want a prompt when the 3MF changed on disk, so that neither reloading nor keeping my edits loses work silently.

## Acceptance criteria

- [ ] A file changed on disk while dirty shows the reload or keep choice; neither choice loses the user's edits silently
- [ ] Reload keeps a recoverable copy of the unsaved edits until the user dismisses it
- [ ] Verified in the VS Code test host (D5)

## Out of scope

- Merging concurrent changes
