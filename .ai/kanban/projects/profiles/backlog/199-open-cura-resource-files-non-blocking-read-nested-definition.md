---
id: 199
title: "Open Cura resource files non-blocking, read nested definitions and flag path-like ids"
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP33"
created: 2026-10-26
---

From PRF-30's reviews (SP10), `vsslicer/modules/profiles/cura/src/adapters/definitions/`.

**Code:** `src/adapters/definitions/folder.ts`, `read.ts` (adapters)

## Acceptance criteria

- [ ] Files are opened with `O_NONBLOCK` (and checked to be regular files after open), so a file swapped for a FIFO after listing cannot block the read; test with a FIFO
- [ ] Definitions and extruders in subfolders are read as Cura does (cite the `Resources.py` lines), within the existing depth and count caps
- [ ] A decoded id that is `..`, contains `/`, `\` or NUL is kept as data but flagged, and the doc says ids are never path-safe; test

## Progress

Not started.
