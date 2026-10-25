---
id: 218
title: "Spike: PrusaSlicer 3.0 CLI stability and a non-GUI build"
type: spike
priority: P3
effort: M
model: opus
area: [prusa]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [216]
created: 2026-10-25
---

Checks the 3.0 CLI: `--load` JSON, preset names with `--datadir`, `--export-config-schema`, the exit-0-on-failure bug, and whether a non-GUI build or a published release exists.

**Code:** `vsslicer/modules/slicer-prusa/` (module: `slicer-prusa`, layer: n/a (spike))

## Acceptance criteria

- [ ] A report states the 3.0 release or build used, the commands that worked and the failure behaviour including the exit-0 bug with recorded stderr
- [ ] It states whether a published non-GUI build exists and the criterion for making 3.0 the default
- [ ] `--export-config-schema` output is recorded for the capability-table generator

## Tasks

- [ ] Get a 3.0 build
- [ ] Try the CLI paths
- [ ] Record schema and failures
- [ ] Write the report

## Progress

Not started.
