---
id: 135
title: "Release `profile-api@0.1.0`: entities, JSON Schema, catalogue, merge and condition evaluator"
type: chore
priority: P0
effort: XS
model: sonnet
area: [schema]
story: US1
milestone: "VSS:M2"
depends_on: [2, 3, 4, 5, 6, 8, 9, 13, 18, 19, 20]
created: 2026-10-25
---

Publishes `profile-api@0.1.0` to the local registry so dependent modules can consume entities, JSON Schema, catalogue, merge and condition evaluator.

**Code:** `vsslicer/modules/profile-api/` (module: `profile-api`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profile-api@0.1.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
