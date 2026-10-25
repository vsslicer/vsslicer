---
id: US87
title: "Cut an object at a plane into two closed parts"
status: reviewed
epic: VSS:E53
---

As a user, I want to cut a model at a plane I place by dragging or typing, keeping the upper part, the lower part or both, so that a large model fits the bed.

## Acceptance criteria

- [ ] The plane is placed by drag and by numeric entry, with flip and a preview; keep upper, lower or both; cut to parts or to objects
- [ ] Cut halves are closed manifold meshes whose volumes sum to the original within 0.1 percent
- [ ] Results go through the mesh repair check and each cut is one undoable command that restores the original exactly
- [ ] A cut on a locked plate's object is refused with the reason
- [ ] Verified only on fixtures (D5) (§3 Planar cut, connectors, dovetail)

## Out of scope

- Connectors (US88)
- Cut along a non-planar surface
