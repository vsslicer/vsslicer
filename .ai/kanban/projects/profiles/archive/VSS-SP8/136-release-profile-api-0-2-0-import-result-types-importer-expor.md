---
id: 136
title: "Release `profile-api@0.2.0`: import result types, importer/exporter/store ports, bundle structure and instance validation"
type: chore
priority: P0
effort: XS
model: sonnet
area: [importers]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [123, 104, 83, 135]
created: 2026-10-25
---

Publishes `profile-api@0.2.0` to the local registry so dependent modules can consume import result types, importer/exporter/store ports, bundle structure and instance validation.

**Code:** `vsslicer/modules/profile-api/` (module: `profile-api`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.2.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profile-api@0.2.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.

- SP8 (sp8-coordinator, 08:00): the increment this card named (import result types, ports, bundle structure, instance validation: PRF-122, 123, 104, 83) already shipped in `profile-api@0.1.0` (PRF-135, `862368d`, SP7). The only change since is PRF-180, a fix with no API change, so this release is the patch **0.1.1** (rule 13), not 0.2.0. Published to the local registry; a scratch project installed `@vsslicer/profile-api@0.1.1` and imported 44 exports including `parseBundleStructure`. Dependents profiles, profiles-prusa, profiles-orca and profiles-cura re-locked to `^0.1.1` once; `node scripts/run.mjs checks` passes. Module `pnpm test` 709 passed.
