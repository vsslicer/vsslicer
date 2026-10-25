---
id: 153
title: "Release `profiles-cura@0.3.0`: intent import and the update source"
type: chore
priority: P2
effort: XS
model: sonnet
area: [importers]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [151, 152, 143]
created: 2026-10-25
---

Publish `profiles-cura@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/profiles-cura/` (module: `profiles-cura`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
