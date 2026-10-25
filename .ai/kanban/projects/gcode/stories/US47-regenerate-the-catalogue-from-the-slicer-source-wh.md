---
id: US47
title: "Regenerate the catalogue from the slicer source when a slicer releases"
status: reviewed
epic: VSS:E50
---

As a maintainer, I want a script that regenerates the placeholder data from the pinned Orca and PrusaSlicer sources, so that a new release is a diff to review, not a hand edit.

## Acceptance criteria

- [ ] The generator reads the C++ placeholder map and definitions from a checked-out slicer source and writes the data files; running it on the pinned commits reproduces the committed files byte for byte (CI)
- [ ] A changed placeholder shows as a data diff with the old and new commit in the provenance line

## Out of scope

- Fetching the sources in CI beyond the pinned cache (the profile packs job already does that).
