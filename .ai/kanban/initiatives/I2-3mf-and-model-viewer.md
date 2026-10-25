---
id: I2
title: 3MF library and model viewer (read-only)
status: approved
milestone: M2
order: 2
projects: VWR
phases: 2
---

## Problem

Projects live in 3MF files with three incompatible config dialects (Bambu/Orca, Prusa 2.x and 3.0, Cura). No tool opens all of them without loss, and VS Code has no 3D viewer.

## Outcome

`vsslicer.project` in viewer mode: open `.3mf`, `.stl` and `.obj` in a WebGL2 viewer, see plates and objects in a tree, see embedded per-plate G-code and thumbnails, and open a plate's G-code in the I1 preview. `@vsslicer/3mf` preserves unknown parts byte-for-byte and detects dialects; `@vsslicer/mesh` parses in workers with a BVH.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 2 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §9 rows: 3MF project with own config dialect (read side), Open other slicers' 3MF, Lossless round trip of unknown parts, Embedded per-plate G-code and thumbnails (read). §3 Import STL, OBJ, 3MF. §16 Web or browser target is deferred to I10.

## Exit criteria

- 3MF Consortium conformance suite passes for the core and Production extension; lib3mf agrees as the CI oracle
- Open and save an untouched project from each dialect: unknown parts, relationships and content types byte-identical
- Dialect detection correct on fixture projects from PrusaSlicer, Orca, Bambu Studio and Cura
- Viewer renders 1, 5 and 20 M triangles within the recorded budgets; snapshot tests pass
- A plate's embedded G-code opens in `vsslicer.gcode` through its exported API

## Order: 2 of 11

Second because it is the next-best-tested library (conformance suites, lib3mf oracle, byte-identical round trips) and the project file is the source of truth everything later edits. It depends only on I1's webview kit and preview API. It can run in parallel with I3.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
