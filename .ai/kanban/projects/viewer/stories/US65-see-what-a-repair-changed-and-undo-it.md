---
id: US65
title: "See what a repair changed and undo it"
status: reviewed
epic: VSS:E36
---

As a user, I want a report per object of what repair merged, removed, filled and flipped, and one undo that restores the original triangles, so that I can trust and reverse a repair.

## Acceptance criteria

- [ ] The report shows vertices merged, faces removed, holes filled and normals flipped per object, in the editor and the tree
- [ ] Repaired meshes replace the original through one undoable command; undo restores the original triangle set exactly; the 3MF keeps the repaired mesh
- [ ] The merge tolerance is a setting with a conservative default and is shown in the report
- [ ] Verified only on fixtures (D5)

## Out of scope

- Per-triangle visual diff
