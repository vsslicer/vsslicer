---
id: 46
title: "Release `printer-bambu@0.1.0`: status, read-only mode and HMS decode"
type: chore
priority: P1
effort: XS
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
depends_on: [45]
created: 2026-10-25
---

Publish `printer-bambu@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-bambu/` (module: `printer-bambu`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
