---
id: US42
title: "Move, rotate and scale objects by gizmo or by number"
status: reviewed
epic: VSS:E33
---

As a user preparing a plate, I want to move, rotate and scale objects, instances and parts with gizmos and by typing numbers, with snapping, so that I place things exactly without leaving VS Code.

## Acceptance criteria

- [ ] Each tool works by gizmo and by number, undoes, and saves into the transform the Orca CLI reads
- [ ] Every command registers with the inverse property test of the editor core
- [ ] Gizmo interactions are covered in the webview harness: drag, snap, numeric entry; Escape cancels without a command
- [ ] Dragging moves a proxy and commits on release; measured on the 5 M triangle fixture
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Cut and boolean (E53); painting (E52)
