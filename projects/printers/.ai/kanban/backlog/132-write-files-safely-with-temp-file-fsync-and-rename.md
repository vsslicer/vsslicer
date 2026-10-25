---
id: 132
title: "Write files safely with temp file, fsync and rename"
type: feature
priority: P0
effort: S
model: sonnet
area: [storage]
story: US27
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [130]
created: 2026-10-25
---

Safe write to the target volume.

**Code:** `vsslicer/modules/printer-folder/src/adapters/...` (module: `printer-folder`, layer: `adapters`)

## Acceptance criteria

- [ ] Write to a temp name in the target directory, `fsync`, then rename; an aborted export (AbortSignal) leaves no partial file under the final name (test)
- [ ] A full disk gives a typed `PrinterError.refused`, not a truncated file

## Tasks

- [ ] Safe writer
- [ ] Abort and full-disk tests

## Progress

Not started.
