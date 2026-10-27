---
id: 240
title: "Release `printers-extension@0.7.0`: Fleet view, groups, queue and send to many"
type: chore
priority: P2
effort: XS
model: sonnet
area: [fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [231, 233, 234, 235, 237, 238, 239]
created: 2026-10-25
---

Publish `printers-extension@0.7.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/apps/printers/` (module: `printers-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.7.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
