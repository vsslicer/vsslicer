---
id: 10
title: Cancel kills the whole process tree within 2 seconds
type: feature
priority: P0
effort: M
model: opus
area: [engine]
story: US5
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [9]
created: 2026-10-25
---

Cancel sends SIGTERM to the process group then SIGKILL on POSIX, and `taskkill /T /F` on Windows, so the engine's helper processes die with it.

**Code:** `vsslicer/modules/slicer/runtime/src/adapters/...` (module: `slicer-runtime`, layer: `adapters`)

## Acceptance criteria

- [ ] A stub that spawns a grandchild and sleeps is gone, with its child, within 2 s of cancel on Linux, macOS and Windows runners
- [ ] Cancel after exit is a no-op; cancel twice is safe
- [ ] No orphan process remains after the test (checked by pid)

## Tasks

- [ ] Process group spawn
- [ ] Windows taskkill path
- [ ] Tests with grandchild

## Progress

Not started.
