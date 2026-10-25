---
id: E35
title: Arrange objects on and across plates, fill bed and multiply
status: reviewed
initiative: I6
project: VWR
order: 8
depends_on: [E34, E9]
rows: ["§4 Automatic arrange (polygon nesting)", "§4 Fill bed, multiply"]
---

Automatic arrange packs a plate's objects by their footprint polygons with spacing and optional rotation, can spill to new plates, skips locked plates, and keeps out of excluded bed areas; fill bed and multiply add copies until a plate is full or a count is reached. Users stop relying on the engine CLI to arrange.

## Scope

In (a new `arrange` module in `@vsslicer/mesh`, run in `worker_threads`; commands in `vsslicer.project`):
- Footprint extraction: convex hull or full outline of each instance's projection, offset by spacing.
- No-fit-polygon placement with rotation candidates, gravity to bed centre or a corner, across plates, avoiding exclusion areas defined by the printer (PRF bed shape and excluded regions), skipping locked plates. Selection-only arrange.
- Fill bed and multiply (copies of one instance until full or count reached).
- Each run is one undoable E32 command; a running arrange can be cancelled.
- Ported code (D2): the placement strategy and settings (distance, rotation, align, multi-plate) follow `OrcaSlicer@09aa0114:src/libslic3r/Arrange.cpp` and `ModelArrange.cpp` (AGPL-3.0) on `deps_src/libnest2d` (LGPL-3.0, combinable with AGPL). Polygon offset and clipping use a JavaScript Clipper2 port chosen in the spike, or a WASM build of Clipper2 if no maintained JS port exists. Provenance notices per ported file.

Out: sequential-print arrange with gantry clearance checks beyond the simple clearance radius, IDEX arrange (`IMEXArrange.cpp`), SMT sequential arrange (P3, E56), wipe-tower placement (SLC, §5).

## Feature-matrix rows

- §4 Automatic arrange (P1): done when arrange meets the fixture metrics below on plate, selection and multi-plate fixtures and is undoable.
- §4 Fill bed, multiply (P2, taken into I6 by the initiative): done when fill bed reaches the fixture count within one copy of Orca's result and multiply places exactly N copies or reports how many fit.

## Acceptance criteria

- [ ] Fixture sets (10, 50 and 200 mixed objects; printer beds rectangular, circular, with exclusion areas): no overlaps (polygon intersection test), every instance inside the printable area, bed utilisation within 5 percent of Orca's arrange on the same set (Orca GUI result recorded once per fixture as the oracle).
- [ ] Locked plates never change; the property test of E34 runs over arrange.
- [ ] Arrange of 200 objects finishes within a recorded budget in a worker and never blocks the extension host; cancel stops it and leaves the model unchanged.
- [ ] Items that cannot fit are reported by name and left where they were, never placed off-bed silently.
- [ ] The Orca CLI slices an arranged fixture with no "object outside bed" warning.
- [ ] Verified only on fixtures (D5).

## Dependencies

- Needs E34 (plates, locks, commands), E9 (meshes, hulls), E13 (bed shape and exclusion areas of the plate's printer).
- Exposes `arrange(plateIds, options)`, `fillBed(instance)`, `multiply(instance, n)` commands to E55 (auto-orient then arrange) and to SLC (arrange before slicing a plate).

## Risks and spikes

- Port route: a TypeScript port of the Orca placement on a JS Clipper2 versus a WASM build of libnest2d plus Clipper2. A WASM build spends an innovation token; spike compares quality and speed on the fixtures and picks one.
- libnest2d uses NLopt for rotation optimisation in Prusa's lineage; if Orca's path needs it, the port uses a fixed rotation candidate set instead (recorded in the spike).

## Eng review

- Scope challenge: arrange and fill bed share the nesting engine; one epic. IDEX and sequential arrange left out (no P1 row needs them).
- Tests: the overlap and in-bounds checks catch geometric bugs; the Orca utilisation comparison catches quality regressions; cancel test catches half-applied results.
- Blast radius: worst case is a badly packed plate; nothing leaves the bed silently. Runs off the host thread.
- Reversibility: one command per run, so undo restores the plate.
- Changed because of the review: added cancel, the "could not fit" report and the in-bounds check against the plate printer's exclusion areas.
