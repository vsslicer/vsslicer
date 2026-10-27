---
id: 129
title: "Release `printers-extension@0.3.0`: open-family adapters and discovery"
type: chore
priority: P1
effort: XS
model: sonnet
area: [api]
story: US25
milestone: "VSS:M3"
sprint: "VSS:SP30"
depends_on: [128]
created: 2026-10-25
---

Publish `printers-extension@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/apps/printers/` (module: `printers-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
