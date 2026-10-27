---
id: 140
title: "Release `profiles@0.1.0`: store, resolve and import use cases"
type: chore
priority: P0
effort: XS
model: sonnet
area: [store]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [38, 39, 35, 36, 44, 45, 46, 47, 48, 49, 50, 51]
created: 2026-10-25
---

Publishes `profiles@0.1.0` to the local registry so dependent modules can consume store, resolve and import use cases.

**Code:** `vsslicer/modules/profiles/profiles/` (module: `profiles`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.1.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profiles@0.1.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
