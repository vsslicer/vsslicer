---
id: E53
title: Cut meshes with connectors and combine them with booleans
status: draft
initiative: I10
project: VWR
order: 12
depends_on: [E33, E36, E52, E31, E2]
rows: ["§3 Planar cut, connectors, dovetail", "§3 Mesh boolean (union, difference, intersection)"]
---

Users split large models to fit the bed and join or subtract parts without leaving VS Code: a planar cut with capped faces and plug, dowel or snap connectors and dovetails, and union, difference and intersection between objects or parts.

## Scope

In (`@vsslicer/mesh` geometry; cut and boolean tools in `vsslicer.project`):
- Boolean and capped planar cut on manifold-3d (Apache-2.0, WASM) in a worker. A WASM dependency spends an innovation token; the alternative is a TypeScript port of Orca's mcut-based path, rejected for size.
- Cut tool: plane placement by drag and numeric entry, keep upper, lower or both, flip, cut to parts or objects, connectors (plug, dowel, snap) and dovetail, with the connector and cut-id model following `OrcaSlicer@09aa0114:src/libslic3r/CutUtils.cpp` and `Model.hpp` connector types (AGPL-3.0, ported with notices).
- Paint (E52) is split with the mesh; `cut_information.xml` is written through E31 so Orca recognises cut parts.
- Results go through E36's repair check; each operation is one undoable command.

Out: cut along a non-planar surface (`CutSurface.cpp`); text and SVG emboss (P3, E56).

## Feature-matrix rows

- §3 Planar cut, connectors, dovetail (P2): done when cut fixtures produce closed meshes with connectors that fit (male and female geometry matches within tolerance), and `cut_information.xml` round-trips with Orca.
- §3 Mesh boolean (P2): done when union, difference and intersection on fixtures produce closed manifold meshes with volumes matching manifold-3d's own test expectations and Orca's result.

## Acceptance criteria

- [ ] Every cut and boolean result has zero open edges and zero non-manifold edges (E9 statistics).
- [ ] Volumes: cut halves sum to the original within 0.1 percent; boolean volumes within 0.5 percent of Orca's mcut result on the fixtures.
- [ ] Connectors: generated plug and hole pairs differ only by the configured clearance (measured on fixtures).
- [ ] Cut information (the cut part of the §9 persistence row owned by E52) round-trips through E31 and opens in Orca (manual matrix).
- [ ] Undo restores the original meshes exactly.
- [ ] Verified only on fixtures (D5).

## Dependencies

- Needs E33 (objects, parts), E36 (repair check), E52 (paint split), E31 (writer), E2 (WASM in a worker).
- Exposes `cut(mesh, plane, options)` and `boolean(op, a, b)` to the emboss rows of E56 if they are reopened.

## Risks and spikes

- manifold-3d requires manifold input; non-manifold user meshes must be repaired first (E36) or the operation refuses with a message.
- WASM size and memory in the webview; spike on the largest fixture.

## Eng review

- Scope challenge: cut and boolean share the manifold geometry kernel and the cap and repair path, so one epic.
- Tests: manifoldness and volume checks catch kernel misuse; connector clearance catches geometry errors that would print badly.
- Blast radius: geometry errors produce unusable parts, never a corrupt file; worker isolation contains crashes.
- Reversibility: undo per operation; the WASM is loaded only when the tools are used.
- Changed because of the review: refuse non-manifold input instead of producing undefined results.
