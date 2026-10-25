---
id: 151
title: "Release `printer-prusalink@0.2.0`: file operations and print position"
type: chore
priority: P1
effort: XS
model: sonnet
area: [prusalink]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [140, 146]
created: 2026-10-25
---

Publish `printer-prusalink@0.2.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-prusalink/` (module: `printer-prusalink`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.2.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
