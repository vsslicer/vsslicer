---
id: US73
title: "Cancel fast and survive an engine crash"
status: reviewed
epic: VSS:E66
---

As a user, I want cancel to return quickly and an engine out-of-memory to be an error, so that the editor never freezes or dies.

## Acceptance criteria

- [ ] Cancel (`worker.terminate()` or process kill) returns within 2 s
- [ ] An out-of-memory in the engine is reported as a typed error and never takes down the extension host (test with a memory-hungry fixture)
- [ ] Progress shown follows the engine's progress callback

## Out of scope

