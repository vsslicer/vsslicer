# Changelog

## Unreleased

- PRF-194: `.curaprofile` archives accept profile ids with a colon or a trailing dot or space (Cura derives ids from the typed name); the NTFS name rules are dropped because entries stay in memory. Empty, NUL, backslash, absolute and `.`/`..` names are still refused.
- PRF-131: read and write .curaprofile archives (flat STORED entries named by profile id, as Cura writes them) with entry-count, name-length, entry-size and total-size limits enforced while inflating.
- PRF-125: Cura quality metadata and `exclude_materials` convert to unified conditions (`convertQualityMetadata`, `curaMachineFlags`, `curaQualityDefinition`, `convertExcludeMaterials`); quality clauses follow the machine's `has_variants`, `has_materials` and `has_machine_quality`; `exclude_materials` is Cura's substring match; depends on `@vsslicer/profile-api` ^0.1.1.
- Module skeleton (`domain/`, `application/`), no public API yet.
