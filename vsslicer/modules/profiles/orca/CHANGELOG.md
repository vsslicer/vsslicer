# Changelog

## Unreleased

- PRF-27: `readOrcaTree` reads an Orca or Bambu Studio `resources/profiles` tree (vendor indices, `machine_model`, `machine`, `process`, `filament`) and flattens each preset: parent, then each `include` in order, then own keys; `nil` becomes `null`; `setting_id` and `filament_id` become `external_ids`. `loadProfileTree` reads the tree from disk without following symlinks. Both cap file size, file count, total bytes, chain depth, includes and merge work (keys every index entry carries plus keys copied while flattening, default 8M) per call (`TREE_LIMITS`).
- PRF-189: the bundle reader no longer reads the dead host byte.
- PRF-183: the bundle reader refuses colons, NFC duplicates, Windows-trimmed names, symlinks on any host carrying Unix modes, CRC mismatches and a non-final end-of-central-directory record.
- PRF-103: Orca/Bambu preset bundle reader and writer (`readBundleArchive`, `writeBundleArchive`) in memory, with entry-count, size, ratio, path-safety, symlink and duplicate limits; depends on fflate 0.8.3.
- Module skeleton (`domain/`, `application/`), no public API yet.
- Added `convertCompatiblePrinters`: Orca and Bambu Studio `compatible_printers` to unified `printer.id` conditions (PRF-124).
- Fixed: compatible_printers conversion reports the length-cap diagnostic once; the real-profile test finds `.reference` relative to the repository (PRF-182).
