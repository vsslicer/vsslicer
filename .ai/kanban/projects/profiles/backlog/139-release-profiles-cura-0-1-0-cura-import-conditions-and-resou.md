---
id: 139
title: "Release `profiles-cura@0.1.0`: Cura import, conditions and resource download"
type: chore
priority: P0
effort: XS
model: sonnet
area: [importers]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [30, 31, 32, 125, 127, 130, 129]
created: 2026-10-25
---

Publishes `profiles-cura@0.1.0` to the local registry so dependent modules can consume Cura import, conditions and resource download.

**Code:** `vsslicer/modules/profiles-cura/` (module: `profiles-cura`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-cura@0.1.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
