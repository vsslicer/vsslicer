---
id: E36
title: Repair broken meshes on import and on request
status: reviewed
initiative: I6
project: VWR
order: 9
depends_on: [E9, E32]
rows: ["§3 Mesh repair"]
---

Broken imports fail to slice. This epic repairs meshes cross-platform: on load (stitching near-duplicate vertices, removing degenerate faces, fixing normals) and on request (filling holes, removing self-intersections), with a report of what was changed and an undo.

## Scope

In (a `repair` module in `@vsslicer/mesh`, run in workers; a "Repair mesh" command and the import-time repair in `vsslicer.project`):
- Load-time repair equivalent to admesh's steps: exact and tolerant vertex merging, removal of degenerate and duplicate faces, normal orientation, neighbour connectivity. Ported (D2) from `OrcaSlicer@09aa0114:deps_src/admesh/*` (GPL-2.0-or-later, combinable with AGPL under GPL-3.0 §13) with notices.
- On-request repair: hole filling and self-intersection removal following Orca's cross-platform pipeline in `OrcaSlicer@09aa0114:src/libslic3r/MeshRepair.cpp` (AGPL-3.0). That file is built on CGAL (GPL-3.0-or-later for the parts it uses, combinable). The order of steps and thresholds are ported; the CGAL algorithms themselves are either replaced by TypeScript implementations or compiled to WASM, decided by the spike.
- Repair report per object (vertices merged, faces removed, holes filled, normals flipped) shown in the editor and tree; repaired meshes replace the original through one undoable command, and the 3MF keeps the repaired mesh.
- E9's statistics drive a "mesh has problems" badge and the repair prompt.

Out: Windows SDK repair (Windows-only, closed API); decimation (P3, E56); repair inside cut and boolean (E53 calls this module).

## Feature-matrix rows

- §3 Mesh repair (P1): done when the broken-mesh fixtures become closed, manifold meshes that the Orca CLI slices without repair warnings, on all three platforms.

## Acceptance criteria

- [ ] Broken-mesh fixtures (open edges, flipped normals, duplicate faces, small holes, self-intersections, zero-area slivers) are repaired to zero open edges and zero non-manifold edges, checked by E9's statistics and by admesh's report as an external oracle.
- [ ] Repaired volume differs from the Orca repair result on the same fixtures by less than 0.5 percent (Orca GUI result recorded once per fixture).
- [ ] Meshes that cannot be repaired (for example, large missing regions) are reported as such and left unchanged, never half-repaired silently.
- [ ] Repair runs in a worker with a progress report and cancel; the extension host is not blocked.
- [ ] Repair then undo restores the original triangle set exactly.
- [ ] Verified only on fixtures (D5).

## Dependencies

- Needs E9 (meshes, statistics), E32 (commands, undo).
- Exposes `repairOnLoad(mesh)` and `repair(mesh, options) -> {mesh, report}` to E37 (STEP tessellation output), E53 (after cut and boolean) and SLC (pre-slice check).

## Risks and spikes

- Self-intersection removal without CGAL is hard to do robustly. Spike: compare a TypeScript port, a CGAL WASM build (innovation token, licence check of the CGAL packages used) and manifold-3d's mesh repair features (shared with E53) on the fixtures; pick one.
- Tolerant vertex merging can close gaps the user meant to keep; the tolerance is a setting with a conservative default and is shown in the report.

## Eng review

- Scope challenge: split from STEP import (E37), which shares only the "import pipeline" label; repair is algorithmic, STEP is a WASM integration. Each is about two sprints.
- Tests: admesh and Orca comparisons are independent oracles; the undo identity catches lossy replacement.
- Blast radius: repair changes user geometry; it is always a visible, undoable command, and load-time repair only does the lossless admesh steps.
- Reversibility: undo per repair; a setting turns load-time repair off.
- Changed because of the review: kept load-time repair to the lossless steps and moved hole filling and self-intersection removal to an explicit command.
