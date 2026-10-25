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
sprint: "VSS:SP6"
depends_on: [41]
created: 2026-10-25
---

Publishes `profiles-data-orca@0.1.0` to the local registry so dependent modules can consume the Orca and Bambu JSON trees.

**Code:** `vsslicer/modules/profiles-data-orca/` (module: `profiles-data-orca`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-data-orca@0.1.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
