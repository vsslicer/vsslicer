---
id: 145
title: "Release `profiles-data-orca@0.1.0`: the Orca and Bambu JSON trees"
type: chore
priority: P0
effort: XS
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [41]
created: 2026-10-25
---

Publishes `profiles-data-orca@0.1.0` to the local registry so dependent modules can consume the Orca and Bambu JSON trees.

**Code:** `vsslicer/modules/profiles-data-orca/` (module: `profiles-data-orca`, layer: n/a (release))

## Acceptance criteria

- [x] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [x] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-data-orca@0.1.0` to the local registry and a scratch project installs it from there
- [x] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

- sp11-coordinator: version 0.1.0 and `## 0.1.0` CHANGELOG heading; `pnpm test` 20/20 and `pnpm build` alone in the module; `run.mjs publish` published `@vsslicer/profiles-data-orca@0.1.0` (the registry had no version before); a scratch project installed `^0.1.0` from http://localhost:4873, its export is `dataRoot` and `data/` holds 18,009 files (the 14,420 Orca and 3,589 Bambu files the CHANGELOG names).

Not started.
