---
id: 107
title: "Export .orca_printer, .orca_filament and .orca_bundle"
type: feature
priority: P1
effort: M
model: sonnet
area: [export]
story: US43
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [106, 53, 135]
created: 2026-10-25
---

Writes Orca bundles from selected entities, without secrets, with an `offline_` bundle id.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/orca/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] `import(export(x))` equals x for printer, filament and bundle types
- [ ] `export(import(b))` is byte-equivalent to b for an unmodified fixture where the zip format allows (entry order and timestamps documented where not)
- [ ] No `bundle_id` contains a user id

## Tasks

- [ ] Write the bundle writer
- [ ] Round-trip tests

## Progress

Not started.
