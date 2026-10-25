---
id: 14
title: "Release `printer-api@0.1.0`: types, ports, hub, fake adapter and contract kit"
type: chore
priority: P1
effort: XS
model: sonnet
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [11, 12, 13, 7, 9]
created: 2026-10-25
---

Publish `printer-api@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-api/` (module: `printer-api`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
