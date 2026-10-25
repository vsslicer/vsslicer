---
id: 76
title: "Build percent-or-absolute, per-extruder table, G-code and formula widgets"
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US29
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [75, 69]
created: 2026-10-25
---

The widgets most likely to mislead: relative values stay relative, keyed per-extruder tables, multiline G-code with a dialect badge (text only), and read-only Cura formulas.

**Code:** `vsslicer/modules/profiles-extension/webview/widgets/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A `50%` value stays `50%` through an edit cycle (not converted to a number)
- [ ] A per-extruder table edits `{"0": .., "1": ..}` for a dual-nozzle fixture and writes keyed values
- [ ] G-code shows its dialect badge; `{expr}` values are shown as formulas and cannot be edited

## Tasks

- [ ] Percent-or-absolute widget
- [ ] Per-extruder table
- [ ] G-code and formula widgets
- [ ] Tests

## Progress

Not started.
