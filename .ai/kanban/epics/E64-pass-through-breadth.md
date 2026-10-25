---
id: E64
title: Extend pass-through to the P2 engine features, G-code hooks, regex substitution and timelapse
status: draft
initiative: I10
project: SLC
order: 8
depends_on: [E29, E30, E67, E28]
rows: ["§2 Sequential (object-by-object) printing", "§2 Mold, conical support or make-overhang-printable, gradual infill", "§2 Klipper adaptive bed mesh (`bed_mesh_*`)", "§7 Regex find and replace (`gcode_substitutions`)", "§7 Feature and role-change G-code hooks", "§12 Timelapse G-code generation"]
---

The smaller P2 rows that are engine pass-through or a post-processing step: sequential printing, Cura's mold and gradual infill and Orca's make-overhang-printable, Klipper adaptive bed mesh, regex substitution, feature and role-change G-code hooks, and timelapse G-code. They ride along with `vsslicer.slicer` as one update. For Klipper users, Cura users and anyone with Prusa substitution rules in their profiles.

## Scope

In:
- Capability-table entries and effect tests (E30 machinery) for: `print_sequence`/`complete_objects` and Cura `one_at_a_time`; Cura `mold_*`, `support_conical_*`, `gradual_infill_*`; Orca `make_overhang_printable*`; Orca `bed_mesh_*`; Orca `change_extrusion_role_gcode` and its process and filament variants; Bambu/Orca `timelapse_type` and `time_lapse_gcode`.
- Regex substitution as a built-in post-processing step (E29's runner), because Orca and Bambu lack `gcode_substitutions` (BO §6): reads the Prusa key from imported profiles and Cura's SearchAndReplace parameters; Prusa semantics (find, replace, flags `i`, `w`, `m`, `s`) written new, porting Prusa's tests where available (AGPL-3.0, D2).
- Sequential printing errors: the engine's collision and height errors (Orca `CLI_VALIDATE_ERROR`) mapped to messages naming the objects. The collision display is VWR's.
- Timelapse: generation is engine side; we pass the template through and, for Cura, offer the TimeLapse behaviour as a built-in step only if no engine key exists.

Out: collision display in the editor (VWR), timelapse retrieval from printers (PRN), placeholder catalogue and template editor (GCP), the placeholder language (PRF).

## Feature-matrix rows

- §2 Sequential (object-by-object) printing (P2): passes through on Orca and Cura; parser sees objects printed one after another; collision errors are user-visible.
- §2 Mold, conical support or make-overhang-printable, gradual infill (P2): table entries and effect tests per engine that supports each.
- §2 Klipper adaptive bed mesh (`bed_mesh_*`) (P2): keys reach the start G-code `BED_MESH_CALIBRATE` parameters.
- §7 Regex find and replace (`gcode_substitutions`) (P2): Prusa rules from imported profiles apply to Orca and CuraEngine output with Prusa's results.
- §7 Feature and role-change G-code hooks (P2): Orca hooks pass through; SuperSlicer `feature_gcode` is mapped where the unified schema models it, otherwise reported unsupported.
- §12 Timelapse G-code generation (P2): `time_lapse_gcode` appears at each layer change in output for profiles that set it.

## Acceptance criteria

- [ ] One effect test per row per supporting engine, in CI against pinned engines
- [ ] Regex: test vectors from Prusa's documented examples and its unit tests (oracle: PrusaSlicer 2.9.x output for the same rules on the same G-code); invalid patterns fail the slice with the rule named
- [ ] Sequential: a fixture that collides produces a message naming both objects; a non-colliding fixture prints objects in the set order
- [ ] Fixtures only (D5), except one timelapse print on the H2C with firmware recorded

## Dependencies

- Needs E29 (step runner), E30 (table and effect tests), E67 (keys present in the schema), E28 (oracle), E65 for the Prusa oracle runs of regex substitution (or a recorded fixture until E65 lands).
- Exposes the regex step for E65 to switch off when the Prusa engine applies substitutions itself.

## Risks and spikes

- Risk: Prusa regex flavour (Boost) versus JavaScript `RegExp`; differences in lookbehind and `\b` are listed and tested; unsupported constructs fail loudly.
- Risk: applying substitutions after Orca changes byte offsets the engine's own metadata (estimates, label lines) relies on; run before `.gcode.3mf` assembly so MD5 and metadata are recomputed.

## Eng review

- Scope challenge: six small rows grouped because each is under a sprint and all reuse E29 and E30; splitting would create epics below the two-sprint minimum.
- The regex step is the only new logic; the rest is data and tests.
- Zero silent failures: unsupported constructs and unmapped hooks warn or fail, never drop.
