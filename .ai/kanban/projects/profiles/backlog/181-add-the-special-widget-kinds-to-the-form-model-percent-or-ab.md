---
id: 181
title: "Add the special widget kinds to the form model: percent-or-absolute, per-extruder, gcode and expr"
type: feature
priority: P0
effort: M
model: sonnet
story: US29
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [70]
created: 2026-10-26
---

Split from PRF-70 at SP8 start (rule 17: an Opus L goes in two halves of under 15 minutes). PRF-70 builds the form model (groups, subgroups, fields) with the base widget kinds; this card adds the special widget kinds.

**Code:** `vsslicer/modules/profiles/src/application/form-model/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Percent-or-absolute, per-extruder, gcode and `{expr}` fields get their own widget kinds, each with a test over a catalogue fixture key
- [ ] The full-catalogue snapshot from PRF-70 is updated and still fails when a catalogue type has no widget kind

## Tasks

- [ ] Add the widget kinds and their detection from catalogue metadata
- [ ] Update the snapshot and tests

## Progress

Not started.
