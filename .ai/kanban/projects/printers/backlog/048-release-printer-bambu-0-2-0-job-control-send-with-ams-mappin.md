---
id: 48
title: "Release `printer-bambu@0.2.0`: job control, send with AMS mapping and AMS sync"
type: chore
priority: P1
effort: XS
model: sonnet
area: [bambu]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [47]
created: 2026-10-25
---

Publish `printer-bambu@0.2.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-bambu/` (module: `printer-bambu`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.2.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
