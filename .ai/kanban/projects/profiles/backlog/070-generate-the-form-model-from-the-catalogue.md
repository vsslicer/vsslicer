---
id: 70
title: Generate the form model from the catalogue
type: feature
priority: P0
effort: M
model: opus
area: [form]
story: US29
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [135, 118]
created: 2026-10-25
---

A pure function from catalogue to groups, subgroups, fields and widget kinds; the layout comes from data so a new key appears without UI code.

**Code:** `vsslicer/modules/profiles/src/application/form-model/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] A snapshot of the form model (groups, fields, widget kinds) for the full catalogue; a catalogue change shows as a reviewed snapshot diff
- [ ] A key added to a catalogue fixture appears in the model without a code change (test)
- [ ] Every type in the catalogue has a widget kind; a missing one fails the snapshot test
- [ ] Percent-or-absolute, per-extruder, gcode and `{expr}` fields get their widget kinds

## Tasks

- [ ] Choose widget kind per type
- [ ] Build groups and ordering
- [ ] Snapshot and data-driven tests

## Progress

Not started.
