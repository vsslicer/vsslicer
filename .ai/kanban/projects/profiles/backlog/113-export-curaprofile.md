---
id: 113
title: Export .curaprofile
type: feature
priority: P1
effort: M
model: sonnet
area: [export]
story: US46
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [112, 54, 135]
created: 2026-10-25
---

Writes `.curaprofile` files that Cura can load.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/bundles/cura/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] `import(export(x))` equals x; an unmodified fixture re-exports byte-equivalently where the format allows
- [ ] No credentials in the output

## Tasks

- [ ] Write the writer
- [ ] Round-trip tests

## Progress

Not started.
