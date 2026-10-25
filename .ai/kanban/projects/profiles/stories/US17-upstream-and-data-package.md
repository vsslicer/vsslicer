---
id: US17
title: "A user gets vendor libraries from a pinned data package or an upstream download"
status: reviewed
epic: VSS:E12
---

A user with no installed slicer gets Orca and Bambu vendor profiles from a bundled data package and Prusa vendor bundles from the upstream repository on request, with no Prusa data shipped by us (D4).

## Acceptance criteria

- [ ] `@vsslicer/profiles-data-orca` holds the Orca@09aa0114 and Bambu@79df7ae JSON trees with LICENSE and `source.commit`; file counts 14 420 and 3 589
- [ ] The Prusa download fetches at a pinned commit, records `source.commit`, leaves no partial bundle on failure, and no Prusa data is in any repository or VSIX
- [ ] Network tests skip with a reason offline and run in CI with a cache outside the repository
- [ ] The VSIX size decision is recorded with measured numbers

## Out of scope

- Bed models and textures beyond fetch-on-first-use.
