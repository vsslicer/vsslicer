---
id: E30
title: Publish an engine capability matrix and verify the P0 and P1 engine features pass through
status: reviewed
initiative: I5
project: SLC
order: 5
depends_on: [E26, E27, E28, E11, E3]
rows: ["§2 Arachne variable-width walls", "§2 Tree and organic supports", "§2 Lightning, gyroid and 3D infill patterns", "§2 Arc fitting (G2/G3 output)", "§2 Ironing", "§2 Fuzzy skin", "§2 Scarf or sloped seams", "§2 Adaptive layer height (automatic)", "§2 Bridge detection over sparse infill", "§2 Pressure equalizer, monotonic infill, ramping travels"]
---

VSSlicer implements no slicing algorithm; the engine features of feature-matrix §2 are surfaced, not built. This epic makes that explicit and tested: each adapter declares, per unified setting, whether its engine supports it, under which native key and values, and a fixture test proves each supported P0 and P1 feature actually changes the engine's output. It is for users, who see unsupported settings marked in the profile form instead of silently ignored, and for PRF, whose generated settings UI reads the matrix.

## Scope

In:
- `SlicerEngine.capabilities(): CapabilityTable` in `vsslicer.slicer`: per unified key (E11 schema), `supported | renamed(nativeKey, valueMap) | unsupported`, plus engine version range. One table per adapter (Orca from E26, CuraEngine from E28), as JSON data with a JSON Schema.
- A generated Markdown capability report per pinned engine version, committed with the tests.
- Pass-through tests: for each row below and each engine that supports it, slice a small fixture with the feature off and on, and assert a measurable effect in the G-code through `@vsslicer/gcode` (E3): roles, widths, arcs, layer heights, feedrates.
- Warnings at slice time when the resolved profile sets a key the chosen engine does not support (surfaced through E29's problem matcher channel).

Out: the settings UI itself (PRF), the preview of the features (GCP; arcs are read by E3), the P2 and P3 §2 rows (E62, E64, E67), the PrusaSlicer column (added by E65 for its own adapter).

## Feature-matrix rows

Each row is P0 or P1. "Done" for each: the capability table has an entry for both engines, and the effect test passes for every engine marked supported.

- §2 Arachne variable-width walls (P0): wall generator enum; effect: varying extrusion widths in walls.
- §2 Tree and organic supports (P0): support type enum; effect: support role present with the tree pattern's layer footprint differing from normal supports.
- §2 Lightning, gyroid and 3D infill patterns (P0): infill pattern enum values per engine (Cura `cross_3d`, `cubicsubdiv`, `lightning`; Orca `gyroid_optimized` and others); effect: infill paths differ per value.
- §2 Arc fitting (G2/G3 output) (P0): Orca only (Cura has none); effect: G2/G3 present and parsed.
- §2 Ironing (P1): effect: an ironing role on top layers.
- §2 Fuzzy skin (P1): effect: outer-wall point displacement within the set thickness.
- §2 Scarf or sloped seams (P1): Orca `seam_slope_*`, Cura `scarf_joint_seam_length`; effect: Z varies along the seam segment.
- §2 Adaptive layer height (automatic) (P1): effect: non-uniform layer heights on a curved fixture. The variable layer height editor is VWR's.
- §2 Bridge detection over sparse infill (P1): Orca `internal_bridge_*`; effect: bridge role over sparse infill.
- §2 Pressure equalizer, monotonic infill, ramping travels (P1): mapped where Orca and Cura have equivalents; entries marked unsupported otherwise; the PrusaSlicer adapter (E65) completes the row.

## Acceptance criteria

- [ ] Capability tables for Orca and CuraEngine validate against their schema and cover every unified key in E11's schema (test fails on an unmapped key: regression when PRF adds keys)
- [ ] One effect test per row per supporting engine, run in CI against the pinned engines; each test names the regression it catches (feature silently dropped by emission or by an engine upgrade)
- [ ] Bumping a pinned engine version regenerates the report; a diff in the report fails CI until reviewed
- [ ] Slicing with an unsupported key set produces one warning per key in Problems; never an error and never silent
- [ ] Verified only on fixtures (D5); the H2C prints one Arachne plus tree-support fixture as a visual sanity check with firmware recorded

## Dependencies

- Needs E26 and E28 (both adapters), E27 (emission, where `renamed` mappings are applied), E11 (unified keys), E3 (oracle; arc parsing).
- Exposes `CapabilityTable` per engine to PRF (settings form greys out unsupported keys) and to E65 and E66 (new adapters add a table and reuse the effect tests).

## Risks and spikes

- Risk: some effects are hard to assert from G-code alone (tree versus normal supports). Mitigation: assert on coarse footprint statistics per layer, documented per test; no image comparison.
- Risk: key mapping between Orca and Cura is a judgement (BO open question 4); the table records it explicitly so it can be reviewed.

## Eng review

- Scope challenge: an alternative was to fold each row's test into E26 and E28. Rejected: the matrix is one deliverable consumed by PRF, and a single epic keeps the effect tests shared across adapters (the same test runs against each engine).
- Smallest: only P0 and P1 rows; P2 pass-through rows wait for I10 (E64), input shaping goes with calibration (E62).
- Explicit over clever: the table is hand-maintained data checked by tests, not inferred from engine help output.
- Zero silent failures: unsupported settings warn; unmapped keys fail CI.
