---
id: 25
title: Validate OFD records against the pinned JSON Schema
type: feature
priority: P1
effort: M
model: sonnet
area: [import]
story: US7
milestone: "VSS:M4"
depends_on: [24]
created: 2026-10-25
---

Draft-07 validation of brand, material, filament, variant and sizes records; invalid records are skipped and reported, an unknown major version fails closed.

**Code:** `vsslicer/modules/filament-ofd/src/domain/...` (module: `filament-ofd`, layer: `domain`)

## Acceptance criteria

- [ ] Valid fixture records pass; a record violating the schema is skipped and listed in the report, never half-imported
- [ ] An unknown major schema version raises a typed `UnsupportedOfdVersion` before any record is read

## Tasks

- [ ] Pick the validator
- [ ] Write the validation
- [ ] Tests

## Progress

Not started.
