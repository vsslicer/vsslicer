---
id: 9
title: Tessellate G2/G3 arcs in I/J and R form
type: feature
priority: P0
effort: L
model: sonnet
area: [parser]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-9-worker
depends_on: [3]
created: 2026-10-25
---

Module: `gcode-parser`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Renderer and later epics draw only straight segments. Ports the R-form centre and discretisation rule from PrusaSlicer@30ef591 libpgcode `ProcessorImpl.cpp:929-975, 1120-1206` (AGPL-3.0, provenance lines per D2).

## Acceptance criteria

- [x] Unit tests: I/J and R forms, full circles, negative R, planes G18/G19
- [x] Inconsistent radius gives a diagnostic and a straight move
- [x] Each tessellated segment is flagged with its source arc

## Tasks

- [x] Port the centre and discretisation code with notices
- [x] Plane handling
- [x] Chord-tolerance tessellation into the buffer
- [x] Diagnostic for bad radius

## Progress

Done in `vsslicer/modules/gcode-parser` 0.8.0 (published to the local registry; empty-store `pnpm install --frozen-lockfile` + tests pass; lint, 269 tests, build pass).
- `src/domain/arc.ts`: pure `tessellateArc` (Marlin plan_arc / G2_G3 R-form port with provenance; chord tolerance + max angle as in libpgcode's rule); `machine.ts` wires G2/G3, options `arcTolerance` (0.05 mm) and `arcMaxAngle` (15 deg).
- Planes G17/G18/G19, helix, E split evenly, F unchanged, full circles, negative R, R wins over I/J. Invalid arcs: `arc-invalid` warning + one straight Arc move. Every chord keeps `MoveFlag.Arc` and the arc's fileOffset (test in `test/arcs.test.ts`, 21 tests).
- SuperSlicer role names added (`Internal perimeter`, `Internal bridge infill`, `Thin wall`, `Milling`); the SuperSlicer role/layer line scans now run (metadata scans still skip it).
- Goldens regenerated (new `arcs` field); counts justified in `.reference/notes/GCP-9-arcs.md`. Orca arcs-on 13155 vs arcs-off 14496.
- Not verified: against firmware output; G90.1/G91.1 are not interpreted.
Files: vsslicer/modules/gcode-parser/{src/domain/arc.ts,machine.ts,parser.ts,tag-tables.ts}, test/{arcs,commands,golden,metadata}.test.ts, test/support/{golden,parser-summary}.ts, test/golden/**, README.md, CHANGELOG.md, package.json; .reference/notes/GCP-9-arcs.md.
