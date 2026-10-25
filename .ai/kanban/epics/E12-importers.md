---
id: E12
title: Import vendor and installed profiles from PrusaSlicer, Orca, Bambu Studio and Cura
status: reviewed
initiative: I3
project: PRF
order: 2
depends_on: [E11, E11]
rows: ["§13 Bundled vendor profile library"]
---

Importers in `@vsslicer/profiles` that turn the user's existing profiles and the vendors' profile libraries into unified entities (E11) while keeping each preset's native form beside it. Users get the printers, filaments and processes they already use without retyping a setting; SLC gets profiles it can emit back to the engine without loss (through E13). We do not maintain a vendor library: Orca and Bambu trees ship as a pinned data package (D2), Prusa bundles are always fetched from upstream on request (D4), fdm_materials (CC0) is bundled.

## Scope
- In, readers written new against the formats in `profiles.md` §1-§3 (porting parsing details from the AGPL sources is allowed with provenance lines, D2):
  - PrusaSlicer 2.9.x INI bundles and user presets: `[vendor]`, `[printer_model:*]`, `[printer:*]`, `[print:*]`, `[filament:*]`, `*abstract*` sections, multi-parent `inherits`, `renamed_from`, `alias`, `compatible_*_condition`. SuperSlicer INI as the same dialect with its 356 extra keys.
  - PrusaSlicer 3.0 YAML (`vendor.yaml` kinds, `preset-*.yaml` trees with `variants`), behind an `experimental` flag pinned to `@30ef591`.
  - Orca and Bambu JSON trees and user presets: vendor index, `machine_model`, `machine`, `process`, `filament`, `include`, `instantiation`, `setting_id`, `filament_id`, `nil`, extruder-variant arrays (H2D/H2C), Orca `user/<id>/` with `.info` sidecars, OrcaFilamentLibrary.
  - Cura `definitions`, `extruders`, `variants`, `quality` and `quality_changes`, `definition_changes`, and fdm_materials XML (`fdmmaterial` v1.3) through the XML-key-to-setting table.
  - Splitting per-nozzle printer presets into `printer_model` + `nozzle` + `overrides`, and Prusa `printer_notes` keyword tests into tags (E11 table).
  - Locating installed configuration folders of each slicer on macOS, Windows and Linux; reading them only, never writing.
  - Upstream download on request: Prusa vendor bundles from the upstream repository at a pinned commit into `globalStorageUri`, recorded as `source.commit` (D4); Cura resources the same way when Cura is not installed. A data package `@vsslicer/profiles-data-orca` with the Orca@09aa0114 and Bambu@79df7ae JSON trees (14 420 and 3 589 files, 23.4 MB and 6.5 MB of JSON), their LICENSE and `source.commit`; bed models and textures are fetched on first use.
  - An `ImportResult {entities, native, diagnostics}` per source; parsing runs in `worker_threads`.
- Out: persisting results (E13); UI commands (E14); `.orca_*`, `.bbscfg`, `.bbsflmt`, INI config bundles and `.curaprofile` (E18); physical printers and their credentials (E16); Cura `intent` files (E57); Cura `=expr` evaluation (kept verbatim, E11 Risks); SLA presets (E58).

## Feature-matrix rows
- §13 Bundled vendor profile library (P0): done when the four ecosystems import from installed folders, the Orca/Bambu data package and Prusa upstream download, with entity counts matching the golden tests, and no Prusa data is in any repository or VSIX.

## Acceptance criteria
- [ ] Golden counts, `PrusaResearch.ini` at `PrusaSlicer@b028299`: 1 vendor, 35 printer models, 238 printers, 633 prints, 6 069 filaments; every abstract section removed after flattening.
- [ ] Golden counts, Orca@09aa0114: 70 vendors plus OrcaFilamentLibrary; Bambu@79df7ae: 12 vendors, including the 11 `Bambu Lab H2C` machine files (4 nozzle presets plus templates).
- [ ] Golden counts, Cura@5bea2f8: 706 definitions, 544 extruders, 1 741 variants, 6 011 quality files; fdm_materials@0c05969 every XML file to one `material`.
- [ ] Golden counts, Prusa 3.0 YAML at `@30ef591`: 288 filament, 13 print, 11 printer, 12 tool presets; `vendor.yaml` 17 printers, 32 printer_configs, 10 tools, 3 feeders, 6 sheets.
- [ ] Every imported entity validates against E11's JSON Schema; every native key is mapped or listed as native-only in the diagnostics (none dropped).
- [ ] Resolved values for at least 20 sample (printer, nozzle, material, process) tuples per ecosystem, including the H2C 0.4 nozzle with Bambu PLA Basic, equal the values computed by the native rules (Prusa last-parent-wins, Orca parent then includes then own keys, Cura stack order); oracle is the upstream CLI's exported config where available (spike), otherwise hand-checked expectations citing `profiles.md` lines.
- [ ] Cycle, unknown parent, malformed INI line, invalid JSON, unknown `type` and unreadable folder each give a diagnostic with file and line and leave other entities importable.
- [ ] Tests needing the network (Prusa download) skip with a reason when offline and run in CI with a cache outside the repository (D4).
- [ ] Import of `PrusaResearch.ini` and of the full Orca tree each finish under 10 s on CI and never block the extension host (measured from a host-side heartbeat).
- [ ] Fixtures only; no hardware (D5).

## Dependencies
- Needs E11 (types, catalogue, evaluator, merge), E11.
- Exposes `import*(source) → ImportResult` and `locateInstalledSlicers()` to E13, E14, E16, E18; the `@vsslicer/profiles-data-orca` package to E13; fdm_materials-derived materials to E41 as a seed.

## Risks and spikes
- Oracle for resolved values: does each upstream CLI print a resolved config (PrusaSlicer `--export-config`/`--save`, Orca `--export-settings`)? Unverified; spike (1 day) before the tuple tests are written.
- Data package size in a VSIX: 30 MB of JSON compresses well but the exact size is unmeasured; spike decides between shipping inside `vsslicer.profiles` and a separate data extension.
- Prusa upstream location for D4: GitHub `PrusaSlicer-settings-prusa-fff` and `-non-prusa-fff` (pinnable commits) versus `preset-repo-api.prusa3d.com` (versioned zips). Proposal: GitHub at a commit; the preset API is E57's update channel.
- Third-party Prusa bundles name other upstreams with unassessed licences (`profiles.md` Licence notes); covered by D4 because nothing is redistributed.
- Bambu `setting_id` and `filament_id` are kept as `external_ids` for interoperability (AMS mapping in PRN); ToS question unverified, noted.

## Eng review
- Scope: about 4-5 sprints; four formats in one library. Split point if it overruns: Cura and fdm_materials become their own epic; Prusa and Orca/Bambu cover the first engine (I5).
- Each golden count catches a regression in section parsing or flattening; tuple tests catch merge-order bugs, the most damaging class.
- Blast radius: importers run in a worker; a crash returns a diagnostic, not a dead extension host. Importers never write into native folders, so a bug cannot damage the user's PrusaSlicer, Orca or Cura setup.
- Reversibility: import results are new files (E13); deleting them reverts. The YAML importer is behind a flag.
- Zero silent failures: listed in the acceptance criteria; the import report (E14) shows them to the user.
