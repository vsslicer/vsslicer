---
id: 199
title: "Release `printer-moonraker@0.3.0`: job queue and history list"
type: chore
priority: P2
effort: XS
model: sonnet
area: [moonraker]
story: US57
milestone: "VSS:M4"
depends_on: [196, 197, 198]
created: 2026-10-25
---

Publish `printer-moonraker@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-moonraker/` (module: `printer-moonraker`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
