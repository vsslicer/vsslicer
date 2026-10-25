---
id: 53
title: Write native export to Orca and Bambu JSON
type: feature
priority: P0
effort: L
model: opus
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [28, 136]
created: 2026-10-25
---

Writes `inherits`, `from`, arrays with `nil`, and rebuilds extruder-variant arrays from keyed values.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/export/orca/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] Import then export of every user preset fixture and 200 sampled vendor presets is byte-equivalent
- [ ] An H2C dual-extruder preset's variant arrays are rebuilt from keyed values to the original array order
- [ ] Numbers kept as the strings the source used

## Tasks

- [ ] Write the JSON writer
- [ ] Rebuild variant arrays
- [ ] Round-trip tests

## Progress

Not started.
