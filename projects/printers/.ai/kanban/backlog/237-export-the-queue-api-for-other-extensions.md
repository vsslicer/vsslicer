---
id: 237
title: Export the Queue API for other extensions
type: feature
priority: P2
effort: S
model: sonnet
area: [fleet]
story: US55
milestone: "VSS:M4"
depends_on: [233, SLC-7]
created: 2026-10-25
---

`Queue` (add, list, events) exported so the slicer extension can 'slice and queue'.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Typed and documented; an item referencing a `slicer-api` sliced artefact can be added from a stub extension

## Tasks

- [ ] Export
- [ ] Docs
- [ ] Stub test

## Progress

Not started.
