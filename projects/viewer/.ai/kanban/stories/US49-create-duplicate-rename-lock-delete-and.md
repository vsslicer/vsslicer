---
id: US49
title: "Create, duplicate, rename, lock, delete and reorder plates"
status: reviewed
epic: VSS:E34
---

As a user with several jobs in one project, I want to manage plates as objects (create, duplicate, rename, lock, delete, reorder), so that each print bed is a unit I can name, protect and send on its own.

## Acceptance criteria

- [ ] Plates can be created, duplicated, renamed, locked, unlocked, deleted and reordered, each as an undoable command; the limit is 36 plates
- [ ] A locked plate is changed by no command except unlock
- [ ] Delete then undo restores plate membership and order
- [ ] Saved plates, names and lock flags reopen in VSSlicer and in the Orca and Bambu Studio GUIs (manual matrix)
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Arrange across plates (E35)
