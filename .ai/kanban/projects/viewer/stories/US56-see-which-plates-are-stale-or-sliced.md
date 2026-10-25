---
id: US56
title: "See which plates are stale or sliced"
status: reviewed
epic: VSS:E34
---

As a user and as the owner of slicing and sending, I want each plate to show valid, stale or sliced state with its artefacts in `.vsslicer/sliced/`, so that outdated G-code is never sent.

## Acceptance criteria

- [ ] Editing a sliced plate marks it stale in the tree and the writer removes its stale artefacts on save
- [ ] Sliced artefacts in `.vsslicer/sliced/` are listed per plate and a plate state event is raised
- [ ] Slice plate and Slice all are offered from the plate menu
- [ ] Verified only on fixtures (D5)

## Out of scope

- Slicing itself (SLC)
