---
id: 34
title: "Add the catalogue commands: download, first-run prompt, revert and report"
type: feature
priority: P1
effort: M
model: sonnet
area: [import, ui]
story: US6
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [16, 21, 33]
created: 2026-10-25
---

Commands to download the catalogue, a first-run prompt, a setting for the URL override, a revert command and the import report shown in a document.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] An integration test with a local HTTP server: the command imports the fixture, the report lists skipped records, and revert restores the previous catalogue
- [ ] Offline shows an error with a retry action and keeps the old cache
- [ ] Nothing is downloaded before the user accepts the first-run prompt

## Tasks

- [ ] Write the commands
- [ ] Prompt and setting
- [ ] Integration test

## Progress

Not started.
