---
id: 115
title: Define the `vsslicer` task type and its definition schema
type: feature
priority: P1
effort: S
model: sonnet
area: [tasks]
story: US18
milestone: "VSS:M3"
depends_on: [100]
created: 2026-10-25
---

`taskDefinitions` for `slice`, `upload` and `print` with typed properties, resolved from `tasks.json`.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The schema validates sample `tasks.json` entries and rejects unknown properties
- [ ] `slice` takes engine, plate and the profile triple; `upload`/`print` take a printer id
- [ ] The schema is exported

## Tasks

- [ ] package.json definitions
- [ ] Resolution tests

## Progress

Not started.
