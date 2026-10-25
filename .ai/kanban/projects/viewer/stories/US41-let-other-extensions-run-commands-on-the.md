---
id: US41
title: "Let other extensions run commands on the open project"
status: reviewed
epic: VSS:E32
---

As the author of the slicer, printer or preview features, I want the project extension to export `ProjectModel.execute`, the `Command` interface, change events and the project folder, so that my feature edits or reads the open project without reaching into its internals.

## Acceptance criteria

- [ ] The extension exports `ProjectModel.execute(command)`, the `Command` interface, change events and `ProjectModel.folder`, with versioned types
- [ ] A stub extension in the test host executes a command and receives the change event
- [ ] Verified only in the VS Code test host (D5)

## Out of scope

- Commands beyond the starter set (E33 to E37)
