---
id: US86
title: "Combine objects with union, difference and intersection"
status: reviewed
epic: VSS:E53
---

As a user, I want to join, subtract and intersect objects or parts in the project, so that I can build and modify models without leaving VS Code.

## Acceptance criteria

- [ ] Union, difference and intersection on fixtures give closed manifold meshes with volumes within 0.5 percent of Orca's mcut result (§3 Mesh boolean)
- [ ] Every result has zero open and zero non-manifold edges by the mesh statistics
- [ ] Operands that are not manifold are refused with a message and a Repair offer; nothing changes
- [ ] The operation is one undoable command and undo restores the original meshes exactly
- [ ] Verified only on fixtures (D5)

## Out of scope

- Cut (US87)
- Text and SVG emboss (P3, E56)
