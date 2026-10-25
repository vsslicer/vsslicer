---
id: US19
title: "See plate thumbnails and sliced state in the tree"
status: reviewed
epic: VSS:E10
---

As a Bambu or Orca user, I want each plate's thumbnail and its sliced time and weight in the tree, so that I know which plates are ready to print.

## Acceptance criteria

- [ ] Every plate of a Bambu/Orca project or `.gcode.3mf` shows its `plate_N.png` thumbnail and sliced state (time and weight from `slice_info.config`); the cover thumbnail is shown
- [ ] A missing thumbnail part shows a placeholder and a notice, not an error
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything outside this story's epic
