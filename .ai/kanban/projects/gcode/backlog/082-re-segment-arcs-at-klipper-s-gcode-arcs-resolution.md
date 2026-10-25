---
id: 82
title: "Re-segment arcs at Klipper's gcode_arcs resolution"
type: feature
priority: P1
effort: S
model: sonnet
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [20]
created: 2026-10-25
---

Module: gcode-planner, layer: domain. Split from GCP-20 (SP3 review r-wave2): the Klipper planner does not re-segment G2/G3 at Klipper's `[gcode_arcs] resolution` (default 1 mm). `marlin.ts` `planArc` already refits the parser's Arc-flagged chords and re-segments them; reuse that path. Source: klipper@ee2c6fb `klippy/extras/gcode_arcs.py`.

## Acceptance criteria

- [ ] Klipper arcs are timed on `resolution`-length segments, whatever the parser's chord count (test: same time at two parser tolerances)
- [ ] `resolution` is a `KlipperOptions` field defaulting to 1 mm

## Progress

Not started.
