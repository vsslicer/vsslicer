---
id: US5
title: "Cancel a running slice and leave nothing behind"
status: reviewed
epic: VSS:E26
---

As a user, I want to cancel a slice and have the engine and everything it started stop, so that no stray process burns CPU and no half-written file shows up.

## Acceptance criteria

- [ ] Cancel kills the whole process tree within 2 s (SIGTERM then SIGKILL on POSIX, `taskkill /T` on Windows) and leaves no file in `.vsslicer/sliced/` (stub that sleeps and spawns a child)
- [ ] The same holds with the pinned Orca on a large fixture in CI
- [ ] Cancelling after the engine finished but before the move is safe and leaves nothing

## Out of scope

- Cancelling post-processing scripts (US21)
