---
id: 141
title: "Release `profiles-prusa@0.2.0`: native INI export and config bundles"
type: chore
priority: P0
effort: XS
model: sonnet
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP14"
depends_on: [52, 110, 137]
created: 2026-10-25
---

Publishes `profiles-prusa@0.2.0` to the local registry so dependent modules can consume native INI export and config bundles.

**Code:** `vsslicer/modules/profiles/prusa/` (module: `profiles-prusa`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.2.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-prusa@0.2.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
