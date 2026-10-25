---
id: US23
title: "Upload and print from tasks"
status: reviewed
epic: VSS:E29
---

As a user, I want `upload` and `print` tasks that send the sliced file to a printer, so that slice, upload and print chain in one task list.

## Acceptance criteria

- [ ] `upload` sends the sliced artefact to a chosen printer through `PrinterRegistry` and `print` uploads and starts; both resolve from `tasks.json` and chain with `dependsOn`
- [ ] A failed `slice` stops `upload` (shared with US18); a failed upload names the printer and the reason
- [ ] Upload and print are thin calls into PRN and add no printer code

## Out of scope

- Fleet multi-printer send and the queue (PRN, I9)
