---
id: US31
title: "Save only what changed and drop stale plate G-code"
status: reviewed
epic: VSS:E31
---

As a user who edits a sliced project, I want parts I did not change to stay byte for byte as they were and the sliced output of plates whose content changed to be removed with a notice, so that outdated G-code is never sent to a printer.

## Acceptance criteria

- [ ] Untouched parts stay byte-identical after an edit to one object (reuses the identity test of the container)
- [ ] Changed parts are regenerated; unchanged parts are copied as original bytes
- [ ] Plate G-code, its md5, plate thumbnails and `slice_info` entries of a plate whose content changed are removed and listed in the save notice
- [ ] Verified only on fixtures (D5)

## Out of scope

- Re-slicing the plate (SLC)
