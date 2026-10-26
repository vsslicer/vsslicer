# Changelog

## Unreleased

- PRF-183: the bundle reader refuses colons, NFC duplicates, Windows-trimmed names, symlinks on any host carrying Unix modes, CRC mismatches and a non-final end-of-central-directory record.
- PRF-103: Orca/Bambu preset bundle reader and writer (`readBundleArchive`, `writeBundleArchive`) in memory, with entry-count, size, ratio, path-safety, symlink and duplicate limits; depends on fflate 0.8.3.
- Module skeleton (`domain/`, `application/`), no public API yet.
- Added `convertCompatiblePrinters`: Orca and Bambu Studio `compatible_printers` to unified `printer.id` conditions (PRF-124).
- Fixed: compatible_printers conversion reports the length-cap diagnostic once; the real-profile test finds `.reference` relative to the repository (PRF-182).
