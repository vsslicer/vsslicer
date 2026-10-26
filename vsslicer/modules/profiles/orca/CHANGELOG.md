# Changelog

## Unreleased

- Module skeleton (`domain/`, `application/`), no public API yet.
- Added `convertCompatiblePrinters`: Orca and Bambu Studio `compatible_printers` to unified `printer.id` conditions (PRF-124).
- Fixed: compatible_printers conversion reports the length-cap diagnostic once; the real-profile test finds `.reference` relative to the repository (PRF-182).
