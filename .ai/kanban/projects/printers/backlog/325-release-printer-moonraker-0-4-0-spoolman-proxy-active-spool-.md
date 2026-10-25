---
id: 325
title: "Release `printer-moonraker@0.4.0`: spoolman proxy, active spool, job end filament used and authorised fetch"
type: chore
priority: P1
effort: XS
model: sonnet
area: [moonraker]
story: "FIL:US37"
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [322, 323, 324]
created: 2026-10-25
---

Publish `printer-moonraker@0.4.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-moonraker/` (module: `printer-moonraker`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.4.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
