---
id: 37
title: Convert AMS trays to the filaments returned by Sync AMS to project
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US12
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [33]
created: 2026-10-25
---

Pure conversion from `materials[]` to the `LoadedFilament[]` shape returned to the caller; the profile write is PRF's.

**Code:** `vsslicer/modules/printer-bambu/src/domain/...` (module: `printer-bambu`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture AMS states convert with type, colour, tray and remain; empty trays are omitted; H2C dual-AMS fixture covered
- [ ] The returned shape is documented for the profiles consumer

## Tasks

- [ ] Converter
- [ ] Docs
- [ ] Tests

## Progress

Not started.
