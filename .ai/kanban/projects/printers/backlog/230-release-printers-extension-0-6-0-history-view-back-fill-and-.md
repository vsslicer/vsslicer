---
id: 230
title: "Release `printers-extension@0.6.0`: history view, back-fill and send context"
type: chore
priority: P1
effort: XS
model: sonnet
area: [history]
story: US53
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [224, 225, 226, 227, 228, 229]
created: 2026-10-25
---

Publish `printers-extension@0.6.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printers-extension/` (module: `printers-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.6.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
