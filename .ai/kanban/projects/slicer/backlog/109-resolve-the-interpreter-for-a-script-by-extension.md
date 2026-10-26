---
id: 109
title: Resolve the interpreter for a script by extension
type: feature
priority: P1
effort: S
model: sonnet
area: [postprocess]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [100]
created: 2026-10-25
---

As Orca does: by extension (`.py`, `.ps1`, `.bat`, `.sh`, native executables).

**Code:** `vsslicer/modules/slicer-extension/src/adapters/...` (module: `slicer-extension`, layer: `adapters`)

## Acceptance criteria

- [ ] Each extension runs on the runners where it applies (`.ps1` and `.bat` on Windows, `.py` and `.sh` on POSIX; `.py` on Windows)
- [ ] An unknown extension with no exec bit fails with the script named
- [ ] Arguments are passed as an array, never through a shell string

## Tasks

- [ ] Table of interpreters
- [ ] Spawn
- [ ] Windows runner tests

## Progress

Not started.
