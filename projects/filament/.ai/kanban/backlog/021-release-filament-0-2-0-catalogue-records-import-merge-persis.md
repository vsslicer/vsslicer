---
id: 21
title: "Release `filament@0.2.0`: catalogue records, import merge, persistence and queries"
type: chore
priority: P1
effort: XS
model: sonnet
area: [import]
story: US11
milestone: "VSS:M4"
depends_on: [18, 19, 20]
created: 2026-10-25
---

Publish `filament@0.2.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/filament/` (module: `filament`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.2.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
