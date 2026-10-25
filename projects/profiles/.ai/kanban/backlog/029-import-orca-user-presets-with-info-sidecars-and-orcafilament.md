---
id: 29
title: Import Orca user presets with .info sidecars and OrcaFilamentLibrary
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US12
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [27, 135]
created: 2026-10-25
---

Reads `user/<id>/` presets and their `.info` sidecars and the shared OrcaFilamentLibrary.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/user/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] A fixture `user/<id>/` tree imports with parent links resolved to vendor entities and `meta.base_version` set from the sidecar
- [ ] A user preset whose parent is missing gets a diagnostic and stays importable as a standalone entity

## Tasks

- [ ] Read sidecars
- [ ] Link parents
- [ ] Write tests

## Progress

Not started.
