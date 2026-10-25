---
id: US81
title: "Paint supports and seams with a brush"
status: reviewed
epic: VSS:E52
---

As a user, I want to paint support enforcers and blockers and seam marks on a model with a circle or sphere brush, so that supports and seams sit where I want them.

## Acceptance criteria

- [ ] Enforcer, blocker and seam painting work with a circle and a sphere cursor; each stroke is one undo step and the inverse property test covers paint commands
- [ ] The painted state is drawn as a per-triangle overlay in a custom shader and a stroke updates only the changed triangles
- [ ] A stroke command stores only the changed triangle subtrees
- [ ] Painting is available only in the editable mode and says why when it is not
- [ ] Painted enforcers, blockers and seam marks slice with supports and seams where painted (checked in US84) (§3 Support and seam painting)
- [ ] Verified only on fixtures (D5)

## Out of scope

- Fill tools (US82)
- Colour painting (US83)
- The slicing effect itself (the engine applies paint)
