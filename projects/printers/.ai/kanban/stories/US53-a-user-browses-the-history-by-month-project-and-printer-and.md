---
id: US53
title: "A user browses the history by month, project and printer and re-sends from it"
status: reviewed
epic: VSS:E46
---

As a user reviewing past prints, I want a History view grouped by month, project and printer, so that I can open the plate or the G-code of an old print and send it again.

## Acceptance criteria

- [ ] A History tree with month, project and printer groupings
- [ ] Each record offers open plate (in the project viewer), open G-code (in the preview) and re-send (through the upload queue), each shown only when the file or project still exists
- [ ] The view updates when the agent appends a record, in every window
- [ ] Integration test with fixture history files

## Out of scope

- Totals dashboard.
- Editing or deleting records.
