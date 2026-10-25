---
id: US22
title: "Never see a blank panel when something fails or is too big"
status: reviewed
epic: VSS:E10
---

As a user, I want every failure shown in the editor with what to do, and oversized models drawn as a box until I say otherwise, so that I always know what happened.

## Acceptance criteria

- [ ] Each error path is shown in the editor and tested: WebGL context failure (message tells the user to enable hardware acceleration), E8 open errors, E9 parse errors, size above budget, missing thumbnail part
- [ ] Above the size budget an object shows as a bounding box with "Draw anyway"
- [ ] Mesh warnings from E9 statistics (open and non-manifold edges) are shown
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything outside this story's epic
