---
id: 411
title: "Release `printer-unofficial-creality@0.1.0`: status, upload, start and CFS for Creality K2"
type: chore
priority: P2
effort: XS
model: sonnet
area: [unofficial]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [410]
created: 2026-10-25
---

Publish `printer-unofficial-creality@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer/unofficial-creality/` (module: `printer-unofficial-creality`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
