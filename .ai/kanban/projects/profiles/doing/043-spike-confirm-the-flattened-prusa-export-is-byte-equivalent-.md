---
id: 43
title: "Spike: confirm the flattened Prusa export is byte-equivalent on 10 presets"
type: spike
priority: P0
effort: S
model: opus
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [25, 135]
created: 2026-10-25
---

PrusaSlicer stores system presets flattened (`PresetBundle.cpp:1367`); this checks that exporting the flattened form reproduces the original bytes before the writer is built.

**Code:** `vsslicer/modules/profiles-prusa/docs/spikes/flatten-export.md` (module: `profiles-prusa`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] 10 Prusa presets compared: import, flatten, write; byte diff reported per preset with the cause of each difference
- [ ] Decision on number formatting (`0.2` vs `0.20`) and key order rules for the writer

## Tasks

- [ ] Pick 10 presets
- [ ] Write and diff
- [ ] Record the rules

## Progress

Not started.
