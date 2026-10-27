---
id: 88
title: "Write the package to a temporary file and rename, leaving the original intact on every failure"
type: feature
priority: P1
effort: M
model: opus
area: [3mf]
story: US32
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [87]
created: 2026-10-25
---

A `PackageSink` port with a Node file-system adapter (and an in-memory side for tests): write to a temp file beside the target, flush, rename over the target; compare the target's recorded size and mtime first.

**Code:** `vsslicer/modules/core/3mf/src/adapters/node/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Disk full, permission denied and file changed since open each leave the original bytes untouched, remove the temp file and return a named error
- [ ] A successful save replaces the file and leaves no temp file
- [ ] The suite runs on Linux, macOS and Windows runners including a rename onto an existing file

## Tasks

- [ ] Port and adapter
- [ ] Failure injection tests
- [ ] CI matrix check

## Progress

Not started.
