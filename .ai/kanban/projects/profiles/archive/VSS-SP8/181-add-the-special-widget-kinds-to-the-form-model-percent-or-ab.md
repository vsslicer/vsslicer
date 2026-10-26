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

Review (sp8-reviewer-13, 08:05): PASS
1. Snapshot vs PRF-70 (2d6b074): 869 of 1966 lines changed, only the widget column (percent_or_absolute 120, per_extruder 693, expr 33, gcode 23); keys and list/hidden flags untouched. Spot-checked 10 per kind against profile-api data JSON, and recomputed all entries: 869/869 match, no special entry missed.
2. form-model.ts: precedence (per_extruder, then expr, then type kind) documented in the WidgetKind comment; Object.hasOwn lookup kept; WIDGET_KINDS stays Record<SettingType,...> so a new catalogue type still fails to compile and the test for unknown types still passes. Note: 257 entries are both per_extruder and have an {expr} default and render as per_extruder (as documented).
3. Ran in profiles: pnpm test (29 pass), lint, build; vsslicer/ run.mjs checks: clean. Tests cover each kind plus real keys.
