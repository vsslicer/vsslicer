---
id: US43
title: "A user imports and exports Orca printer, filament and bundle files"
status: reviewed
epic: VSS:E18
---

A user drops a `.orca_printer`, `.orca_filament` or `.orca_bundle` from a forum into VS Code and gets its entities, and exports their own for someone on Orca.

## Acceptance criteria

- [ ] Fixture bundles from Orca@09aa0114 including a real saved one import with the expected counts
- [ ] `import(export(x))` equals x; `export(import(b))` is byte-equivalent for unmodified bundles where the format allows (differences documented)
- [ ] Exported ids use the `offline_` form; no user id is written
- [ ] A missing listed file, unknown bundle type or version mismatch give a diagnostic

## Out of scope

- Orca cloud sync.
