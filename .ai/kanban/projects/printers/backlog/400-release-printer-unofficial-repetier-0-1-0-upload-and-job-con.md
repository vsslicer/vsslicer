---
id: 400
title: "Release `printer-unofficial-repetier@0.1.0`: upload and job control for Repetier-Server"
type: chore
priority: P2
effort: XS
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [399]
created: 2026-10-25
---

Publish `printer-unofficial-repetier@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-unofficial-repetier/` (module: `printer-unofficial-repetier`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
