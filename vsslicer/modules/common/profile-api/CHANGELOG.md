# Changelog

## Unreleased

- PRF-13: `fromNative`/`toNative` convert a value per conversion kind (identity, scale, sign flip, percent-of, enum map, split) as exact inverses, with `lossy` reasons and a typed `ConversionError`.
- PRF-1: module skeleton (`domain/`, `application/`), no public API yet.
- PRF-2: entity types `Vendor`, `PrinterModel`, `Nozzle`, `Surface`, `Feeder`, `Material`, `Process`, `PrinterInstance`, the shared `EntityBase` fields and `SettingValue` (types only).
- PRF-8: `evaluate(expr, context)` returns `{compatible, diagnostic?}`; parse errors, unknown keys and type mismatches yield compatible plus a diagnostic (PrusaSlicer semantics); regexes are full-match and guarded against catastrophic backtracking.
- PRF-12: settings catalogue contract: `CatalogueEntry`, `Catalogue`, the 14 FFF `GROUPS` (with home entities), `RESERVED_GROUPS`, `KEY_PREFIXES`, the closed `Conversion` set (identity, scale, sign_flip, percent_of, enum_map, split), override scopes, and `catalogueEntrySchema`/`catalogueSchema` (JSON Schema 2020-12).
