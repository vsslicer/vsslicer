---
id: 19
title: Persist the catalogue with an atomic swap and the previous copy
type: feature
priority: P1
effort: S
model: sonnet
area: [import]
story: US6
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [17]
created: 2026-10-25
---

`catalogue.json` in the store directory: written to a new file and swapped on success, the previous file kept for revert, source revision and date recorded.

**Code:** `vsslicer/modules/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] A write failure midway leaves the current catalogue intact (fault-injection test)
- [ ] The previous catalogue file is kept after a successful swap; source revision and date round-trip

## Tasks

- [ ] Write the store
- [ ] Fault-injection test

## Progress

Not started.
