---
id: 5
title: Read zip entries with a size cap
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
depends_on: [3, 4]
created: 2026-10-25
---

Reads the central directory and exposes each entry's raw and inflated bytes lazily, refusing declared sizes above a cap before inflating.

**Code:** `vsslicer/modules/3mf/src/adapters/zip/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Stored and deflated entries, data descriptors and zip64 read correctly on test archives
- [ ] A corrupt zip and a zip bomb (declared size above the cap) throw the typed errors from the fixtures
- [ ] Raw (still compressed) entry bytes are available for byte-identical save

## Tasks

- [ ] Wrap fflate for central directory reading
- [ ] Add the size cap check
- [ ] Expose raw entries
- [ ] Tests

## Progress

Not started.
