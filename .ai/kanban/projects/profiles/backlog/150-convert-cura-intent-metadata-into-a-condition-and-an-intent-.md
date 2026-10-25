---
id: 150
title: Convert Cura intent metadata into a condition and an intent override
type: feature
priority: P2
effort: S
model: sonnet
area: [importers]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [149, 125]
created: 2026-10-25
---

From an intent file's metadata (`definition`, `variant`, `material`, `quality_type`, `intent_category`) build the `when` condition and the override block tagged with the intent, using the same condition construction as the quality conversion.

**Code:** `vsslicer/modules/profiles-cura/src/domain/...` (module: `profiles-cura`, layer: `domain`)

## Acceptance criteria

- [ ] Table test over metadata samples from each of the eight categories gives the expected condition and `intent`
- [ ] A file without `intent_category` or `quality_type` returns a diagnostic, not a block

## Tasks

- [ ] Mapping
- [ ] Tests

## Progress

Not started.
