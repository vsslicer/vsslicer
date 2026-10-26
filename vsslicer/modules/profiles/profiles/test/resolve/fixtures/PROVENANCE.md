# Resolve tuple fixtures (PRF-49)

Test data only; not shipped. Hand-built unified entities (`{kind, entity}` per entry) in the shape the
importers produce, small enough to check every resolved value by hand. Not real-importer output: the
real-importer run is PRF-133 (`profiles-extension` tuple test).

- `bambu-h2c.json`: the H2C 0.4 nozzle + Bambu PLA Basic + 0.20 mm Standard tuple, shaped like
  `profiles-orca`'s split (a `printer_model` with one `nozzle.id == '...'` override per nozzle preset,
  `profiles-orca/src/adapters/split/split.ts`) over the chains of `BambuStudio@79df7ae:resources/profiles/BBL/`
  (`machine/Bambu Lab H2C 0.4 nozzle.json` -> `fdm_bbl_3dp_002_common` -> `fdm_machine_common`;
  `process/0.20mm Standard @BBL H2C.json` -> `fdm_process_dual_0.20_nozzle_0.4` -> `fdm_process_dual_common` ->
  `fdm_process_common`; `filament/Bambu PLA Basic @BBL H2C.json` -> `Bambu PLA Basic @base` -> `fdm_filament_pla` ->
  `fdm_filament_common`). Values are the upstream ones under unified keys (first element of a variant
  array); the high-flow nozzle, its override and `Bambu PLA Matte @BBL H2C` are illustrative.
- `prusa-mk4s.json`: shaped like `profiles-prusa`'s split of `PrusaSlicer-2.9@b028299:resources/profiles/PrusaResearch.ini`
  (`[print:0.20mm SPEED @MK4S 0.4]` at :5276 with its two parents, `[filament:Prusament PLA]` at :36345,
  `[printer:Original Prusa MK4S 0.4 nozzle]` at :41225); `printer_notes` tags in `settings.tags` as the importer
  writes them. `support_angle` 35 and the Prusament PLA values (215, 27.99, 1.24, Prusa Polymers) are upstream;
  the 0.6 override's 15.5 is upstream's `[filament:Prusament PLA @PG 0.6]`; the rest is illustrative.
- `cura-s5.json`: shaped like `profiles-cura`'s output for `Cura@5bea2f8:resources/definitions/ultimaker_s5.def.json`
  (`fdmprinter` -> `ultimaker` -> `ultimaker_s5`), with AA/BB nozzle variants on a dual instance and a quality as a
  `process` whose override uses the `printer.model and nozzle.id and material.base` condition
  (docs/research/profiles.md §6). Values are illustrative; the `{expr}` value shows a Cura formula passes through.

Licence: profile data derived from AGPL-3.0 (PrusaSlicer, Bambu Studio) and LGPL-3.0 (Cura) projects; this module
is AGPL-3.0-or-later.
