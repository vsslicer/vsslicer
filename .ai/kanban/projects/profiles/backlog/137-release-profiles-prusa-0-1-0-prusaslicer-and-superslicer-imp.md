---
id: 137
title: "Release `profiles-prusa@0.1.0`: PrusaSlicer and SuperSlicer import, per-nozzle split, conditions and upstream download"
type: chore
priority: P0
effort: XS
model: sonnet
area: [importers]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [25, 26, 34, 10, 11, 89, 40, 33, 42]
created: 2026-10-25
---

Publishes `profiles-prusa@0.1.0` to the local registry so dependent modules can consume PrusaSlicer and SuperSlicer import, per-nozzle split, conditions and upstream download.

**Code:** `vsslicer/modules/profiles-prusa/` (module: `profiles-prusa`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profiles-prusa@0.1.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
