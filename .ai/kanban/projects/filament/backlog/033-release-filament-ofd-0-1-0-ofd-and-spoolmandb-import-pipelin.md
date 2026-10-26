---
id: 33
title: "Release `filament-ofd@0.1.0`: OFD and SpoolmanDB import pipeline"
type: chore
priority: P1
effort: XS
model: sonnet
area: [import]
story: US7
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [29, 30, 31]
created: 2026-10-25
---

Publish `filament-ofd@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/filament-ofd/` (module: `filament-ofd`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
