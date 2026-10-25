---
id: 108
title: Import .bbscfg and .bbsflmt
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US44
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [103, 136, 27, 105]
created: 2026-10-25
---

Reads Bambu Studio bundles (they share the layout family with Orca bundles).

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/bambu/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] The Bambu Studio fixtures, including the real saved bundle, import with expected counts; `setting_id` and `filament_id` land in `external_ids`
- [ ] A version mismatch gives a diagnostic

## Tasks

- [ ] Write the reader
- [ ] Tests

## Progress

Not started.
