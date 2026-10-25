---
id: 7
title: Write the JSONL event log and the snapshot file store
type: feature
priority: P1
effort: M
model: sonnet
area: [model]
story: US2
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [5]
created: 2026-10-25
---

`events.jsonl` append-only log and `entities.json` snapshot (a cache rebuildable from the log), written atomically (temp file and rename) in a directory the caller passes.

**Code:** `vsslicer/modules/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] Append writes one JSON line per event; the snapshot is written to a temp file and renamed
- [ ] Deleting the snapshot and reloading rebuilds it from the log byte for byte
- [ ] Round trip with the in-memory fake passes the same store contract test

## Tasks

- [ ] Write the log appender and reader
- [ ] Write the snapshot writer
- [ ] Shared store contract test

## Progress

Not started.
