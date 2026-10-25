---
id: US43
title: "Use every profile option as a variable in templates"
status: reviewed
epic: VSS:E50
---

As a user, I want every config option of the target slicer to complete and hover as a variable, with its type, label and whether it is a vector, so that I can read `{nozzle_diameter[0]}` and know what it is.

## Acceptance criteria

- [ ] Option variables come from the `profile-api` catalogue (canonical keys, native names per dialect, type, label, tooltip, per-extruder flag) and complete in `[...]` and `{...}`
- [ ] A vector option completes with its index form and hover says it is indexed
- [ ] An option that does not exist in the target slicer's dialect is not offered

## Out of scope

- Editing profile values; resolving what an option evaluates to.
