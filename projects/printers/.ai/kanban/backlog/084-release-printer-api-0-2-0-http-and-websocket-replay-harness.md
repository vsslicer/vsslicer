---
id: 84
title: "Release `printer-api@0.2.0`: HTTP and WebSocket replay harness"
type: chore
priority: P1
effort: XS
model: sonnet
area: [api]
story: US24
milestone: "VSS:M3"
depends_on: [83]
created: 2026-10-25
---

Publish `printer-api@0.2.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-api/` (module: `printer-api`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.2.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
