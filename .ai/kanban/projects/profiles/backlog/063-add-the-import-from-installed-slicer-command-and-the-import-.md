---
id: 63
title: "Add the 'Import from installed slicer' command and the import report"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US26
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [59, 140, 60, 137, 138, 139]
created: 2026-10-25
---

Lists what `locateInstalledSlicers()` found, imports the chosen sources, and prints counts and diagnostics to an output channel.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/commands/import/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] On fixture configuration folders for each OS layout and each ecosystem the command imports through the real adapters and the report shows counts and diagnostics
- [ ] The source folders are byte-identical afterwards (checksum test)
- [ ] With nothing found the command says so and offers the download command

## Tasks

- [ ] Write the command and quick pick
- [ ] Write the report
- [ ] Integration tests

## Progress

Not started.
