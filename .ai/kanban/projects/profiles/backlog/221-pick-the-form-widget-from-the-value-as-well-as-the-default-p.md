---
id: 221
title: "Pick the form widget from the value as well as the default, per extruder too"
type: feature
priority: P1
effort: S
model: sonnet
area: [form]
story: US29
milestone: "VSS:M2"
created: 2026-10-26
---

From the PRF-69 spike (`vsslicer/modules/apps/profiles/docs/widget-spike.md`): 257 of 290 Cura formula keys are `per_extruder`, and the form model gives `per_extruder` priority, so they show an empty editor; and 15,782 Cura `.inst.cfg` values are `=formula` on keys whose default is a literal.

**Code:** `vsslicer/modules/profiles/profiles/src/application/` form model (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] The widget kind is chosen from the effective value as well as the default (a `=formula` value on a literal-default key gets the formula view)
- [ ] The per-extruder inner editor dispatches the same way, with a test on a real `per_extruder` formula key
- [ ] **Bounds:** none new (no input parsing)

## Progress

Not started.
