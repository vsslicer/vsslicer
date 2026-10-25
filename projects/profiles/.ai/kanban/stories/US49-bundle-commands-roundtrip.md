---
id: US49
title: "A user runs bundle import and export from VS Code with grouped undo and no secrets"
status: reviewed
epic: VSS:E18
---

A user imports a bundle from the explorer or the command palette, can delete everything it added in one go, and exports selected entities without credentials; the exports load in the desktop apps.

## Acceptance criteria

- [ ] Importing adds entities under one bundle id; deleting the group removes exactly them
- [ ] Exported bundles of every format contain no credentials (scan reused from US37)
- [ ] One exported `.orca_printer` and one `.bbscfg` load in the desktop apps, versions recorded

## Out of scope

- A bundle marketplace.
