---
id: 73
title: Map OpenPrintTag fields to the model and derive UUIDv5
type: feature
priority: P2
effort: M
model: sonnet
area: [tags]
story: US32
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [72]
created: 2026-10-25
---

Instance, material and brand UUIDs, GTIN, material, colours, weights, density, diameter, temperatures and aux `consumed_weight` into spool/filament candidates; UUIDv5 derivation when UUIDs are omitted (spec section 3.2).

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] The spec examples map to the expected candidates; derived UUIDs equal the spec's worked examples
- [ ] `consumed_weight` becomes a `tag` observation (not a booking) per E42's rule

## Tasks

- [ ] Write the mapping
- [ ] UUIDv5
- [ ] Example tests

## Progress

Not started.
