---
id: E18
title: Import and export profile bundles (.orca_*, .bbscfg, .bbsflmt, INI bundles, .curaprofile)
status: reviewed
initiative: I3
project: PRF
order: 8
depends_on: [E12, E13, E14, E18]
rows: ["§13 Profile bundle import and export (`.ini` bundle, `.orca_*`, `.bbscfg`, `.curaprofile`)"]
---

Reading and writing the files users share profiles with: Orca's `.orca_printer`, `.orca_filament` and `.orca_bundle`, Bambu Studio's `.bbscfg` and `.bbsflmt`, PrusaSlicer config bundles (`.ini`), Cura `.curaprofile`, and the profiles embedded in 3MF projects. Users can drop a bundle from a forum or a friend into VS Code and get its printers and filaments as entities, and send their own profiles to someone on Orca, Bambu Studio, PrusaSlicer or Cura.

## Scope
- In (written new in `@vsslicer/profiles`, commands in `vsslicer.profiles`): zip bundles with `bundle_structure.json` (`version`, `bundle_id`, `bundle_type`, preset lists, `printer_vendor`, `printer_asset`) per `profiles.md` §2; PrusaSlicer config bundle sections including `[presets]`; `.curaprofile` after the format spike.
- In: 3MF-embedded profiles (`Metadata/project_settings.config`, PrusaSlicer `Slic3r_PE.config`) read through E18's container API and converted into user entities.
- In: export of selected entities to each format, without secrets (E16), using the zip library E11 picks for the monorepo (E18 needs the same).
- In: archive safety: entries must stay inside the import folder (Orca checks the same, `PresetBundle.cpp:2428`), limits on entry count and uncompressed size, no symlinks.
- Out: Cura `.curapackage` marketplace packages; writing profiles into 3MF projects (E27 and VWR own project output).

## Feature-matrix rows
- §13 Profile bundle import and export (P1): done when every listed format imports and exports and an exported bundle re-imports to the same entities.

## Acceptance criteria
- [ ] Fixture bundles made by Orca@09aa0114, Bambu Studio@79df7ae and PrusaSlicer 2.9.6 (built from their writers' documented layout, plus at least one bundle saved by each real app) import with the expected entity counts.
- [ ] Round trip: import(export(x)) equals x for each format; export(import(b)) is byte-equivalent to b for unmodified bundles where the format allows (zip entry order and timestamps documented where not).
- [ ] Malicious archives (path traversal, absolute paths, zip bomb, symlink, 10 000 entries) are rejected with a message and write nothing.
- [ ] A 3MF from E18's fixture set with Orca `project_settings.config` imports its process and filaments.
- [ ] Exported bundles contain no credentials (E16 scan reused).
- [ ] Manual: one exported `.orca_printer` and one `.bbscfg` load in the desktop apps (versions recorded). Fixtures otherwise (D5).

## Dependencies
- Needs E12 (dialect readers), E13 (store, native export), E14 (commands), E18 (3MF container reading).
- Exposes `importBundle(uri)` and `exportBundle(ids, format)`; E58 can call import when a project's embedded profiles are not in the store.

## Risks and spikes
- `.curaprofile` layout is unverified (`profiles.md` Comparison); spike (1 day) against a file saved by Cura 5.x, else the format moves to E57.
- Bundle `bundle_id` contains a user id (`<user_id>_<name>_<time>`); export uses the `offline_` form so no account id leaks.

## Eng review
- Scope: about 2-3 sprints. Kept apart from E12 because it adds archive handling, export and 3MF coupling; E12 stays a pure set of dialect readers.
- Archive-safety tests are the guard against the worst failure (writing outside the store).
- Reversibility: import adds entities under one bundle id and can be undone by deleting that group.
- Zero silent failures: unknown bundle type, missing listed file and version mismatch each give a diagnostic.
