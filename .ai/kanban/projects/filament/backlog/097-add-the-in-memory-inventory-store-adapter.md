---
id: 97
title: Add the in-memory inventory store adapter
type: feature
priority: P0
effort: S
model: sonnet
area: [model]
story: US39
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [5]
created: 2026-10-27
---

The E70 first version of the inventory runs on memory, not on the JSONL event log and lock files (FIL-7 to FIL-12), which stay where they are. FIL-5 writes an in-memory `EventLogStore` fake for its tests; this card makes it a shipped adapter that the `vsslicer.filament` extension can open, with optional seed data. The file store replaces it later through the same port, with no change to the use cases.

**Code:** `vsslicer/modules/filament/filament/src/adapters/memory/` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] `createMemoryInventory(seed?)` returns an `EventLogStore` backed by an array, exported from `@vsslicer/filament/memory`; the test fake from FIL-5 is this adapter (one implementation, not two)
- [ ] A seed of brands, filaments and spools is applied as events, so replay from empty gives the seeded snapshot
- [ ] The create, update and archive use cases of FIL-5 pass their tests against it; nothing is written to disk (a test checks no `node:fs` import in the adapter)

## Tasks

- [ ] Promote the fake to an adapter with seed data
- [ ] Export path and tests

## Progress

Not started.
