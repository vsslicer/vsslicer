# Changelog

## Unreleased

- Added: the file-system store: one JSON file per entity, temp-file-and-rename writes, a lock and a `meta.updated` check that turn a second window's save into a conflict carrying both versions (PRF-45).
- Added: `runImportInWorker` runs an import in a worker thread with a time budget, cancel and a host heartbeat; crashes become diagnostics (PRF-39).
- Added: `readInstalledFolder` and `importInstalledFolder`: a read-only, sorted walk of an installed configuration folder into importers, bounded (optional `FolderLimits`), links skipped (PRF-36).
- Added: the in-memory profile store (get, list, query, ProfileFiles port) with user-layer precedence on duplicate ids (PRF-44).
- Added: importer registry (`createImporterRegistry`), a composite Importer that routes files to the first claiming importer and turns a failing importer into a diagnostic, and the `importProfiles` use case over a `ProfileSource` with an `EntityValidator` port; at most 50000 files per import (PRF-38).
- PRF-71: `buildSearchIndex` searches settings over keys, labels, native names and tooltips; name hits rank above tooltip hits; query and per-query work are bounded (`lastCost`).
- PRF-181: form model special widget kinds: percent-or-absolute, per-extruder, gcode and `{expr}`.
- PRF-70: `buildFormModel` generates the form model from the settings catalogue: groups, per-home-entity subgroups, fields and base widget kinds; a full-catalogue snapshot; depends on `@vsslicer/profile-api` ^0.1.0.
- PRF-35: `locateInstalledSlicers` finds PrusaSlicer (2.x and 3), SuperSlicer, OrcaSlicer, Bambu Studio and Cura config folders (and Cura data folders on Linux, `kind`) on macOS, Windows and Linux, including Flatpak and Snap; missing or unreadable folders are diagnostics.
- Module skeleton (`domain/`, `application/`), no public API yet.
