# Changelog

## Unreleased

- PRF-10: `convertPrusaCondition` converts PrusaSlicer compatibility conditions (nozzle diameter and high flow, printer model, `printer_notes` tags through a table built from PrusaResearch.ini@b028299, Prusa 3.0 tool/feeder/base_model) to unified conditions, with lossy flags and diagnostics; tag regexes run on profile-api's non-backtracking matcher; depends on `@vsslicer/profile-api` ^0.1.0.
- Module skeleton (`domain/`, `application/`), no public API yet.
