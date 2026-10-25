---
id: 20
title: "Query the catalogue by text, EAN and slicer id"
type: feature
priority: P1
effort: M
model: sonnet
area: [import]
story: US11
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [17]
created: 2026-10-25
---

`Inventory.catalogue.search(text)`, `byEAN(ean)` and `bySlicerIds(ids)` over an in-memory index.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Each query returns the expected records on a 15,000-variant synthetic catalogue plus the pinned fixture records; search by brand, name and EAN
- [ ] A text search over 15,000 variants completes in under 50 ms (measured)

## Tasks

- [ ] Build the index
- [ ] Write the queries
- [ ] Performance test

## Progress

Not started.
