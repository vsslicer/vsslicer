---
id: 320
title: "Release `printer-api@0.4.0`: job id and outcome, tray metadata, tag event and AuthorizedFetch"
type: chore
priority: P1
effort: XS
model: sonnet
area: [api]
story: "FIL:US13"
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [316, 317, 318, 319]
created: 2026-10-25
---

Publish `printer-api@0.4.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/common/printer-api/` (module: `printer-api`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.4.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
