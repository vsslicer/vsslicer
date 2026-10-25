---
id: 104
title: Model and validate bundle_structure.json
type: feature
priority: P1
effort: S
model: sonnet
area: [importers]
story: US43
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [3]
created: 2026-10-25
---

The `version`, `bundle_id`, `bundle_type`, preset lists, `printer_vendor` and `printer_asset` structure of Orca/Bambu bundles.

**Code:** `vsslicer/modules/profile-api/src/domain/bundle/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] Valid fixtures parse; unknown `bundle_type`, missing listed file and unsupported `version` each give a typed diagnostic
- [ ] Exported ids use the `offline_` form; a test shows no user id is ever written

## Tasks

- [ ] Write the types and validation
- [ ] Tests

## Progress

Not started.
