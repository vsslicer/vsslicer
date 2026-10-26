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
owner: GCP-82-worker
depends_on: [20]
created: 2026-10-25
---

Module: gcode-planner, layer: domain. Split from GCP-20 (SP3 review r-wave2): the Klipper planner does not re-segment G2/G3 at Klipper's `[gcode_arcs] resolution` (default 1 mm). `marlin.ts` `planArc` already refits the parser's Arc-flagged chords and re-segments them; reuse that path. Source: klipper@ee2c6fb `klippy/extras/gcode_arcs.py`.

## Acceptance criteria

- [x] Klipper arcs are timed on `resolution`-length segments, whatever the parser's chord count (test: same time at two parser tolerances)
- [x] `resolution` is a `KlipperOptions` field defaulting to 1 mm

## Progress

Done. `src/domain/arc.ts` (new, `resegmentArc`: circle fit, `max(1, floor(len/resolution))` segments, Z and E spread evenly) and `klipper.ts`: Arc-flagged chords with one file offset are held until the arc ends, then run as segments through the normal Klipper queue; each chord takes its share of the segment time by length, so one timing record per parser move is kept. A G4 or the next non-arc move flushes the arc first. `KlipperOptions.resolution` (default 1, RangeError if not > 0). CHANGELOG under Unreleased (no bump; coordinator releases).

Verified: `pnpm lint && pnpm test && pnpm build` in gcode-planner. New tests: a half circle at 15 and 60 chords has the same total time (2 digits), chord start times strictly increase, `resolution` default equals 1 and 0.2 differs, resolution 0 throws.

Chords that do not fit a circle (one chord, collinear) run as the parser cut them.

Files: vsslicer/modules/gcode-planner/src/domain/arc.ts (new), src/domain/klipper.ts, test/klipper.test.ts, CHANGELOG.md.

Review failed: duplicated circle fit between arc.ts and marlin.ts (centre, planArc). Fix: share one fit from arc.ts, make marlin.ts planArc use it, delete marlin.ts centre.

Fix round: `arc.ts` now exports `fitArc` (centre, radius, angle, direction, start angle) and `arcPoint`; `resegmentArc` and `marlin.ts` `planArc` both use them (each keeps its own segment count and hints), and marlin.ts's `centre` copy is deleted. Verified: lint, 79 tests and build pass; Marlin/Buddy/Klipper/Bambu totals on all 15 parser fixture gcode files are identical before and after (scratch script). Files: vsslicer/modules/gcode-planner/src/domain/arc.ts, src/domain/marlin.ts. Checkpoint code in klipper.ts untouched.
