---
id: US39
title: "Keep engine outputs, queue and history in a .vsslicer folder beside the project"
status: reviewed
epic: VSS:E32
---

As a user and as the owner of the slicer and printer features, I want a documented `.vsslicer/` folder next to the 3MF with `sliced/` and reserved `queue.json` and `history/` paths, so that sliced output and job history have a known home that git can ignore.

## Acceptance criteria

- [ ] `.vsslicer/` is created on first need with `sliced/` and the reserved paths, a README line, and an offer of a recommended `.gitignore` entry
- [ ] `ProjectModel.folder` gives the URIs; PRN can read and write its reserved paths through it
- [ ] Verified only on fixtures (D5)

## Out of scope

- The content of queue and history (PRN, I9)
