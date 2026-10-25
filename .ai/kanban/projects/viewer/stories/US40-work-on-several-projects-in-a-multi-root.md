---
id: US40
title: "Work on several projects in a multi-root workspace"
status: reviewed
epic: VSS:E32
---

As a user with several projects in several workspace folders, I want each project to edit, undo and save independently in one window, so that I can prepare a batch without mixing them up.

## Acceptance criteria

- [ ] Projects in every workspace folder are found
- [ ] Two projects in two workspace folders edit, undo and save independently; undo in one never touches the other
- [ ] One editor per document with split views allowed (`supportsMultipleEditorsPerDocument`)
- [ ] Verified in the VS Code test host (D5)

## Out of scope

- Cross-project operations
