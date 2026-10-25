---
id: 10
title: Check arc-fitted fixtures against slicer output
type: chore
priority: P0
effort: S
model: sonnet
area: [parser]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-10-worker
depends_on: [9, 2]
created: 2026-10-25
---

Module: `gcode-parser` (tests). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Proves the arc row against the real slicers.

## Acceptance criteria

- [x] Arc-fitted Orca and Bambu Studio fixtures tessellate within 0.05 mm chord tolerance (test)
- [x] R form resolves to the same centre as I/J on those fixtures (test)

## Tasks

- [x] Generate arc-fitted fixtures if missing
- [x] Write the tolerance tests

## Progress

Coordinator: PrusaSlicer replaced by Bambu Studio per the owner's Q11 answer (focus on Bambu/Orca); the PrusaSlicer arc fixture is GCP-79.


Done (Orca, plus Bambu Studio and SuperSlicer/ArcWelder as extras), in `vsslicer/modules/gcode-parser/test/arc-fixtures.test.ts` (tests only, no src change, no version bump; lint and all 286 tests pass):
- Chord tolerance: for every G2/G3 in the three arc fixtures (568 + 945 + 248), an independent line scan gives the true circle (start + I/J); all chord vertices lie within 0.05 mm of it, chord sagitta <= 0.05 mm, the last vertex is the command's end, the chords' angles sum to the sweep, no `arc-invalid`.
- R vs I/J: the fixtures use I/J only (asserted). Each arc (end projected onto the circle, R = +-radius, negative over 180 degrees) is re-run in R form: same tessellation through the parser (float32 resolution) and through `tessellateArc` to 1e-6. Full circles and exact half circles cannot be written with R and are skipped (>= 90% of arcs checked).
- Orca arcs-on vs arcs-off cylinder: worst arcs-on extruding vertex to the arcs-off polyline is 0.0097 mm (bound 0.05 + resolution 0.012).

Not met: no arc-fitted PrusaSlicer fixture (not installed; owner question Q11), so both criteria stay unticked as written ("PrusaSlicer and Orca"). The empty-store install proof was not run (no package.json or lockfile change).

Files: vsslicer/modules/gcode-parser/test/arc-fixtures.test.ts; .reference/notes/GCP-10-arc-fixtures.md.
