# Changelog

## Unreleased

- PRF-29: `readOrcaUserPresets` reads `user/<id>/{machine,process,filament}` presets with their `.info` sidecars, links `inherits` to vendor (or other user) presets, sets `meta.base_version` from the sidecar `base_id`, and keeps a preset with a missing parent as standalone with a warning. `loadProfileTree` takes optional file suffixes (to read `.info`). The `base/` custom roots of each type folder are read first; a preset is named by its file stem (an inner `name` that differs warns `name-mismatch`); one named like a vendor preset of its type is skipped as in Orca; other files under `user/` warn instead of vanishing.

- PRF-126: `splitOrcaPrinters` turns the machine presets of a read tree into one `printer_model` per `machine_model` (shared settings, an `overrides` block per nozzle, `nozzles`) and a `nozzle` entity per preset, matched by `printer_model` and `printer_variant`; presets with no model, no variant or another bed or nozzle count stay standalone `printer_model`s. `native` keeps every source preset by entity id.

- PRF-28: `decodeVariants` and `encodeVariants` turn the per-extruder-variant arrays of machine and process presets (H2D, H2C) into values keyed by 0-based extruder then variant name (machine limits as `[normal, silent]` pairs; per-extruder options by extruder) and back to the original array order; a wrong-length array or malformed slot list stays as it is with a warning.

- PRF-27: `readOrcaTree` reads an Orca or Bambu Studio `resources/profiles` tree (vendor indices, `machine_model`, `machine`, `process`, `filament`) and flattens each preset: parent, then each `include` in order, then own keys; `nil` becomes `null`; `setting_id` and `filament_id` become `external_ids`. `loadProfileTree` reads the tree from disk without following symlinks. Both cap file size, file count, total bytes, chain depth, includes and merge work (keys every index entry carries plus keys copied while flattening, default 8M) per call (`TREE_LIMITS`).
- PRF-189: the bundle reader no longer reads the dead host byte.
- PRF-183: the bundle reader refuses colons, NFC duplicates, Windows-trimmed names, symlinks on any host carrying Unix modes, CRC mismatches and a non-final end-of-central-directory record.
- PRF-103: Orca/Bambu preset bundle reader and writer (`readBundleArchive`, `writeBundleArchive`) in memory, with entry-count, size, ratio, path-safety, symlink and duplicate limits; depends on fflate 0.8.3.
- Module skeleton (`domain/`, `application/`), no public API yet.
- Added `convertCompatiblePrinters`: Orca and Bambu Studio `compatible_printers` to unified `printer.id` conditions (PRF-124).
- Fixed: compatible_printers conversion reports the length-cap diagnostic once; the real-profile test finds `.reference` relative to the repository (PRF-182).
