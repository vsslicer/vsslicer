---
id: 156
title: "Release `profiles-prusa@0.3.0`: the update source"
type: chore
priority: P2
effort: XS
model: sonnet
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [154, 141]
created: 2026-10-25
---

Publish `profiles-prusa@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/profiles-prusa/` (module: `profiles-prusa`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
