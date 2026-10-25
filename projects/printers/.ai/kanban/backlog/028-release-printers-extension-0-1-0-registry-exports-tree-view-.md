---
id: 28
title: "Release `printers-extension@0.1.0`: registry, exports, tree view and manual add"
type: chore
priority: P1
effort: XS
model: sonnet
area: [api]
story: US6
milestone: "VSS:M3"
depends_on: [24, 26, 27]
created: 2026-10-25
---

Publish `printers-extension@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printers-extension/` (module: `printers-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
