---
id: 144
title: "Release `profiles@0.2.0`: export, form model, instances, wizard model and bundle use cases"
type: chore
priority: P0
effort: XS
model: sonnet
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP18"
depends_on: [55, 56, 70, 71, 72, 84, 91, 92, 95, 96, 97, 37, 114, 115, 140]
created: 2026-10-25
---

Publishes `profiles@0.2.0` to the local registry so dependent modules can consume export, form model, instances, wizard model and bundle use cases.

**Code:** `vsslicer/modules/profiles/profiles/` (module: `profiles`, layer: n/a (release))

## Acceptance criteria

- [ ] CHANGELOG entry and version bump to 0.2.0; `pnpm test && pnpm build` pass alone inside the module
- [ ] `node scripts/run.mjs publish` publishes `@vsslicer/profiles@0.2.0` to the local registry and a scratch project installs it from there
- [ ] The published exports match the increment named in the title (api-extractor or exports test)

## Tasks

- [ ] Write the changelog and bump the version
- [ ] Run `run.mjs publish`
- [ ] Install in a scratch project

## Progress

Not started.
