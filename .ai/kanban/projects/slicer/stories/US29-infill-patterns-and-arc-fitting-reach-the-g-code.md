---
id: US29
title: "Infill patterns and arc fitting reach the G-code"
status: reviewed
epic: VSS:E30
---

As a user, I want lightning, gyroid and 3D infill patterns and arc fitting to work through each engine, so that I get the engine's own quality features.

## Acceptance criteria

- [ ] Lightning, gyroid and 3D infill patterns (P0): enum values per engine (Cura `cross_3d`, `cubicsubdiv`, `lightning`; Orca `gyroid_optimized` and others); effect: infill paths differ per value
- [ ] Arc fitting (P0): Orca only (Cura has none, entry `unsupported`); effect: G2/G3 present and parsed by `@vsslicer/gcode`

## Out of scope

- Nothing beyond the epic's own Out list
