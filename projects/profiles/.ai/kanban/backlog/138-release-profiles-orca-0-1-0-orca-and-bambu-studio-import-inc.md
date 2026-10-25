---
id: 138
title: "Release `profiles-orca@0.1.0`: Orca and Bambu Studio import including the H2C variants"
type: chore
priority: P0
effort: XS
model: sonnet
area: [importers]
story: US12
milestone: "VSS:M2"
depends_on: [27, 28, 29, 126, 124, 90, 128]
created: 2026-10-25
---

Publishes `profiles-orca@0.1.0` to the local registry so dependent modules can consume Orca and Bambu Studio import including the H2C variants.

**Code:** `vsslicer/modules/profiles-orca/` (module: `profiles-orca`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-orca@0.1.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
