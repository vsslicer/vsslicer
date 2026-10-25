---
id: US34
title: "A user follows a running print in the G-code preview"
status: reviewed
epic: VSS:E25
---

As a user, I want a 'Follow in preview' command that opens the file in the G-code preview and moves the cursor with the printer, so that I see where my print is.

## Acceptance criteria

- [ ] `Follow in preview` calls `GcodePreview.follow(uri, offset)`; PRN never imports GCP code
- [ ] End to end: a recorded Moonraker print fixture drives the preview's follow cursor to the expected move
- [ ] A file not sent from this machine is downloaded via `printer://` with a size prompt, or follow degrades to progress only with a message

## Out of scope

- Rendering the follow view.
