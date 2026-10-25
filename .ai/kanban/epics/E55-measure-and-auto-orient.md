---
id: E55
title: Add the measure tool and auto-orient
status: draft
initiative: I10
project: VWR
order: 14
depends_on: [E9, E10, E33, E34, E35]
rows: ["§3 Measure", "§3 Auto-orient"]
---

Two smaller viewer tools that power users expect: measuring distances, angles, diameters and plane separations on the model (and scaling to a measured length), and auto-orient, which turns each object to the orientation with the least overhang and the best bed contact before arrange.

## Scope

In (`vsslicer.project`, `@vsslicer/mesh`):
- Measure: point, edge, circle and plane feature detection under the cursor via the BVH; distance, angle, diameter, plane-to-plane; "scale to this length" as an E33 scale command. Written new; PrusaSlicer's `Measure.cpp` read for the feature-detection approach and portable under D2 if needed (notices then).
- Auto-orient: ported (D2) from `OrcaSlicer@09aa0114:src/libslic3r/Orient.cpp` (AGPL-3.0; overhang and bottom-area weights at `Orient.hpp:34,60`) with notices; runs in a worker per object or per plate; skips locked plates; offers arrange (E35) afterwards.

Out: assembly measuring and alignment (P3, E56).

## Feature-matrix rows

- §3 Measure (P2): done when measurements on fixture geometry with known dimensions are correct within 0.01 mm and 0.1 degree.
- §3 Auto-orient (P2): done when orientations chosen for the fixtures match Orca's within its tie tolerance, or have no larger overhang area.

## Acceptance criteria

- [ ] Known-dimension fixtures (calibration cube, cylinder, angled block) measure correctly within the tolerances above.
- [ ] Auto-orient fixtures: overhang area after orienting is less than or equal to Orca's result on the same fixtures.
- [ ] Auto-orient is one undoable command per run and never touches locked plates.
- [ ] Verified only on fixtures (D5).

## Dependencies

- Needs E9 (BVH), E10 (viewer), E33 (scale command), E35 (arrange after orient), E34 (locked plates).
- Exposes `orient(objects)` to SLC (pre-slice option).

## Risks and spikes

- None beyond porting effort; Orient.cpp is about 30 KB of self-contained code.

## Eng review

- Scope challenge: two unrelated small tools grouped to reach a sensible epic size (about two sprints); they can be split into separate stories with no shared code. Considered merging measure into E10; kept out because it is P2 and E10 is I2.
- Tests: known dimensions and the Orca overhang comparison are clear oracles.
- Blast radius: small; orientation changes are undoable.
- Changed because of the review: auto-orient respects locked plates (E34 invariant).
