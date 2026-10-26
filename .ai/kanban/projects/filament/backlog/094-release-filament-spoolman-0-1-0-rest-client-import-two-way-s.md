---
id: 94
title: "Release `filament-spoolman@0.1.0`: REST client, import, two-way sync, offline queue and Moonraker proxy transport"
type: chore
priority: P1
effort: XS
model: sonnet
area: [spoolman]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [91, 93, 82]
created: 2026-10-25
---

Publish `filament-spoolman@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/filament-spoolman/` (module: `filament-spoolman`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
