---
id: 378
title: "Release `printers-extension@0.9.0`: longFilenames default for storage export"
type: chore
priority: P2
effort: XS
model: sonnet
area: [storage]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [377]
created: 2026-10-25
---

Publish `printers-extension@0.9.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/apps/printers/` (module: `printers-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.9.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
