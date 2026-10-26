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

- [x] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [x] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-cura@0.1.0` to the local registry and a scratch project installs it from there
- [x] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [x] Write the changelog and bump the version
- [x] Run `run.mjs publish`
- [x] Install in a scratch project

## Progress

Not started.

**Released (sp12-coordinator):** version 0.1.0 and the CHANGELOG heading; `pnpm test` 207/207 and `pnpm build` alone in the module; `node scripts/run.mjs publish` published `@vsslicer/profiles-cura@0.1.0` to http://localhost:4873; a scratch project (`@vsslicer:registry` scoped to the local registry) installed it and imported `fetchCuraResources`, `readCuraProfile`, `readCuraMachineInstances`, `readCuraQualities` (38 exports). Export `.curaprofile` (PRF-113) goes to 0.2.0 (PRF-143).
