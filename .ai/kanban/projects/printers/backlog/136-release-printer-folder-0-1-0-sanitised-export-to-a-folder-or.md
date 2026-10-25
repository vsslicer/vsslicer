---
id: 136
title: "Release `printer-folder@0.1.0`: sanitised export to a folder or drive"
type: chore
priority: P1
effort: XS
model: sonnet
area: [storage]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [135, 133]
created: 2026-10-25
---

Publish `printer-folder@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-folder/` (module: `printer-folder`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
