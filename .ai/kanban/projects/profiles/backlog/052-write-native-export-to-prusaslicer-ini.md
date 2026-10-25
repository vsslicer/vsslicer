---
id: 52
title: Write native export to PrusaSlicer INI
type: feature
priority: P0
effort: L
model: opus
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [43, 25, 136]
created: 2026-10-25
---

Writes Prusa INI sections, flattened or with one `inherits` as PrusaSlicer stores user presets; an unmodified entity exports its stored native form byte for byte.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/export/prusa/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] Import then export of every user preset fixture and 200 sampled vendor presets is byte-equivalent (key order and number formatting kept through the native form)
- [ ] Only edited keys are re-formatted, by Prusa's rules (spike decision)
- [ ] An unknown unified key produces a diagnostic and is left out of the file

## Tasks

- [ ] Write the section writer
- [ ] Keep native text for untouched keys
- [ ] Round-trip tests

## Progress

Not started.
