# Changelog

## Unreleased

- PRF-89: `readPhysicalPrinterIni` (2.9) and `readPhysicalPrinterJson` (3.0) read PrusaSlicer physical printers into an instance (model, host, `host_type`) plus a separate credential; malformed `preset_names` skips the printer as upstream does; bounds: 1 MiB JSON, depth 16, 2,048-character host.
- PRF-185: the INI reader caps total entries at 500,000 (`MAX_ENTRIES`) with one diagnostic.
- PRF-184: `PRINTER_VENDOR_PRUSA3D` converts to a tag test like every other keyword.
- PRF-33: bounded YAML subset reader and `readVendorYaml` for the PrusaSlicer 3.0 preset tree (experimental flag, pinned to PrusaSlicer@30ef591).
- PRF-191: `readPresetYaml` reads PrusaSlicer 3.0 `preset-*.yaml` trees with nested variants (experimental flag; 32 levels, 10,000 variants per file).
- PRF-11: test: a hand-computed oracle of 79 PrusaSlicer compatibility cases (2.9 INI and 3.0 YAML) for the condition converter and the profile-api evaluator.
- PRF-24: `parseIni` reads PrusaSlicer INI vendor bundles and user presets into a native section tree (kinds, abstract sections, verbatim values in order, line numbers) as boost `read_ini` does, with diagnostics for malformed lines, rejected headers, duplicates and invalid UTF-8, and bounds on input, line length, sections, keys and diagnostics.
- PRF-10: `convertPrusaCondition` converts PrusaSlicer compatibility conditions (nozzle diameter and high flow, printer model, `printer_notes` tags through a table built from PrusaResearch.ini@b028299, Prusa 3.0 tool/feeder/base_model) to unified conditions, with lossy flags and diagnostics; tag regexes run on profile-api's non-backtracking matcher; depends on `@vsslicer/profile-api` ^0.1.0.
- Module skeleton (`domain/`, `application/`), no public API yet.
- PRF-25: `importPrusaIni` / `prusaIniImporter` flatten PrusaSlicer 2.9 INI bundles and user presets as `flatten_configbundle_hierarchy` does (last-listed parent wins, `renamed_from` not inherited, abstract sections dropped) into vendor, printer_model (`[printer_model]` and per-nozzle `[printer]`), process and material entities, with `when` from the condition converter (only when `compatible_printers` is empty, as upstream) and the native form (verbatim values plus `native_only` keys) in `native`; every entity id (`__proto__` too) gets an own `native` entry; cycles and unknown parents give diagnostics; bounds: inherits depth 32, 16 parents, 4,000,000 inherited keys, 100,000 sections and 256 MiB per import call. Adds `ajv` as a dev dependency for the schema test.
