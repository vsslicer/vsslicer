---
id: US37
title: "Get my unsaved edits back after a reload or a crash"
status: reviewed
epic: VSS:E32
---

As a user with unsaved edits, I want a window reload or a killed extension host to bring the edits back with the document still dirty, so that VS Code's hot exit protects a project as it protects text.

## Acceptance criteria

- [ ] Dirty project, reload window: the edits are back and the document is still dirty; the same after killing the extension host (integration test with `@vscode/test-electron`)
- [ ] The backup stores the original-bytes reference plus the command log, not a full 3MF; the backup of a 100 MB project after 50 transform edits stays under 1 MB
- [ ] The log carries a version; an incompatible log falls back to opening the last saved file with a message
- [ ] The log is compacted on save and capped, measured with 10,000 commands
- [ ] Verified only on fixtures and in the VS Code test host (D5)

## Out of scope

- Backup of non-project text files
