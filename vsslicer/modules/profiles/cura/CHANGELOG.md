# Changelog

## Unreleased

- PRF-125: Cura quality metadata and `exclude_materials` convert to unified conditions (`convertQualityMetadata`, `curaMachineFlags`, `curaQualityDefinition`, `convertExcludeMaterials`); quality clauses follow the machine's `has_variants`, `has_materials` and `has_machine_quality`; `exclude_materials` is Cura's substring match; depends on `@vsslicer/profile-api` ^0.1.1.
- Module skeleton (`domain/`, `application/`), no public API yet.
