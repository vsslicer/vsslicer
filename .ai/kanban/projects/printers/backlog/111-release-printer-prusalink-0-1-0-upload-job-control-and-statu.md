---
id: 111
title: "Release `printer-prusalink@0.1.0`: upload, job control and status"
type: chore
priority: P1
effort: XS
model: sonnet
area: [prusalink]
story: US21
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [110]
created: 2026-10-25
---

Publish `printer-prusalink@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-prusalink/` (module: `printer-prusalink`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
