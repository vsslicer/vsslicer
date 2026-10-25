---
id: E28
title: Drive the CuraEngine CLI with our own Cura settings resolution
status: reviewed
initiative: I5
project: SLC
order: 3
depends_on: [E26, E27, E67, E12, E13, E65, E28]
rows: []
---

Adds the second engine adapter: CuraEngine run headless through its CLI, with VSSlicer resolving Cura's definition, quality and material stack and its `value` formulas itself, because the engine resolves nothing and exits on any missing key (`features-cura.md` §4). It is for users with Cura profiles or machines Orca does not cover, and it proves the `SlicerEngine` interface is not Orca-shaped.

## Scope

In:
- CuraEngine adapter in `vsslicer.slicer`: `CuraEngine slice -j <machine.def.json> -e<n> ... -l <model.stl> -o <out.gcode>` with the definition search path set (`CURA_ENGINE_SEARCH_PATH`), or `-r <resolved.json>` (`{global, extruder.N, <model>.stl}`, ENG §2). The resolved-JSON route is preferred because it carries the whole flattened stack in one file; the spike below confirms it.
- Always `-o` (logs share stdout, ENG §2); progress from the spdlog "Starting <stage>..." lines mapped to coarse stages; cancel kills the process; exit 1 or 2 and SIGFPE mapped to typed errors.
- Settings resolution: a formula evaluator for the Python-expression subset in `fdmprinter.def.json` (`resolveOrValue`, `extruderValue(s)`, `anyExtruderWithMaterial`, `defaultExtruderPosition`, `math.*`; counts in CU open questions), the stack order definition < variant < material < quality < intent < user, `limit_to_extruder`, and per-extruder settings. Written new; Cura and Uranium are LGPL-3.0, CuraEngine AGPL-3.0, and porting Uranium's `SettingFunction` semantics is allowed (D2) with provenance lines.
- Models: plates exported to STL per object by `@vsslicer/mesh` (CuraEngine reads no 3MF).
- Engine source: CuraEngine taken from the pinned Cura release (no standalone release, `slicer-landscape.md` §3), detected or downloaded like Orca in E26.

Out: Arcus transport and live layers (an option inside E66), CuraEngine gRPC plugins, Cura's Python post-processing `Script` classes (E29 runs external scripts only), the WASM build (E66), painted multi-material UV input.

## Feature-matrix rows

None directly; Cura's support for the §2 rows is recorded in E30's capability matrix.

## Acceptance criteria

- [ ] Evaluator tests: for a fixture set of (machine, extruder count, material, quality) tuples, every resolved value equals the value Cura computes; the oracle is a table exported once from a pinned Cura release run by hand and committed as a fixture, with the Cura version recorded
- [ ] Every setting key the engine reads is present in the resolved JSON; a test runs the pinned CuraEngine on each fixture tuple and fails on any "missing setting" log line or exit 2
- [ ] Fixture models slice in CI on Linux, macOS and Windows; `@vsslicer/gcode` parses the output with the expected layer count and roles; our estimate is within the I5 tolerance of the engine's `;TIME:` header
- [ ] Two-extruder fixture: support and adhesion settings come from the `limit_to_extruder` extruder (regression: wrong extruder's temperature in support layers)
- [ ] Cancel, bad-model and bad-argument paths each produce a distinct user message (stub and real engine tests)
- [ ] Unsupported formula function names fail resolution with the setting key and function named, never a silent default
- [ ] Verified only on fixtures: the H2C is not a Cura target (D5); no hardware check

## Dependencies

- Needs E26 (interface, registry, download), E27 (output assembly for thumbnails and labels on plain G-code), E12 (Cura definitions and `fdm_materials` imported), E67 (unified schema keys for mapping), E13 (`resolve` returning the Cura stack), E28 (oracle), E65 (`@vsslicer/mesh` STL export).
- Exposes `resolveCuraStack(stack): ResolvedCuraSettings` so PRF's settings form can show Cura computed values; PRF must not build a second Cura evaluator (open question to the coordinator).

## Risks and spikes

- Spike: the exact headless CLI contract (`features-cura.md` open questions): `-j` with `-e` versus `-r`, which defaults load from definitions, and how per-extruder settings are passed. Resolve by reading `CommandLine.cpp` at the pinned revision and running fixtures.
- Risk: formula language breadth; an unknown helper blocks a profile. The evaluator lists unsupported functions per profile on import so gaps show before slicing.
- Risk: CuraEngine is extracted from Cura's AppImage, DMG and installer; extraction per platform is its own CI step. macOS quarantine findings from E26 apply.

## Eng review

- Scope challenge: considered putting the formula evaluator in PRF; kept here because only this adapter needs fully resolved Cura values and the anchor names settings resolution as E28. Flagged to the coordinator to avoid two evaluators.
- CLI chosen over Arcus for the first Cura adapter: boring technology, same process model as E26, no protobuf framing to own. D2 removes the licence objection to Arcus, so it remains open for E66.
- Tests name their oracle (Cura-exported values, engine logs, GCP parser). The regression each catches is named above.
- Blast radius: engine crashes are contained in the child process; a wrong resolved value is the real risk, hence the exhaustive missing-key check.

## Coordinator reconciliation

- Owns the Cura `=expr` evaluator (Python-subset); PRF does not build a second one.
