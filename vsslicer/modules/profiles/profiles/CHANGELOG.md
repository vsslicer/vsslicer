# Changelog

## Unreleased

- PRF-70: `buildFormModel` generates the form model from the settings catalogue: groups, per-home-entity subgroups, fields and base widget kinds; a full-catalogue snapshot; depends on `@vsslicer/profile-api` ^0.1.0.
- PRF-35: `locateInstalledSlicers` finds PrusaSlicer (2.x and 3), SuperSlicer, OrcaSlicer, Bambu Studio and Cura config folders (and Cura data folders on Linux, `kind`) on macOS, Windows and Linux, including Flatpak and Snap; missing or unreadable folders are diagnostics.
- Module skeleton (`domain/`, `application/`), no public API yet.
