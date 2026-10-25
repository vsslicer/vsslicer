---
id: US35
title: "The slicer extension author gets a handle on a queued upload"
status: reviewed
epic: VSS:E25
---

As the author of 'slice and send', I want `PrinterRegistry.upload` to return a queue item handle with state and progress, so that I can show and cancel it.

## Acceptance criteria

- [ ] `PrinterRegistry.upload` returns a handle with state, progress and cancel; a direct (unqueued) upload stays available behind a setting for debugging
- [ ] The handle type is documented and released in `printers-extension`

## Out of scope

- Slicing.
