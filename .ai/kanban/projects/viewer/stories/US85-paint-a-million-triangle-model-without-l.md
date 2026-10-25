---
id: US85
title: "Paint a million-triangle model without lag"
status: reviewed
epic: VSS:E52
---

As a user with a detailed model, I want painting to stay responsive on a million triangles, so that I can paint the models I actually print.

## Acceptance criteria

- [ ] Painting a 1 M triangle mesh keeps frame time inside the budget recorded for the viewer, for strokes and after fills
- [ ] Tree memory, decode and encode time and fill time are recorded and guarded in CI
- [ ] The subdivision depth limit is chosen from the measurement
- [ ] Verified only on fixtures (D5)

## Out of scope

- Meshes above the size policy's limit
