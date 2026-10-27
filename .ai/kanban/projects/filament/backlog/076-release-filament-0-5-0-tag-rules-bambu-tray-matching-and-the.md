---
id: 76
title: "Release `filament@0.5.0`: tag rules, Bambu tray matching and the OpenPrintTag parser"
type: chore
priority: P1
effort: XS
model: sonnet
area: [tags]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP36"
depends_on: [70, 74, 75]
created: 2026-10-25
---

Publish `filament@0.5.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/filament/filament/` (module: `filament`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.5.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
