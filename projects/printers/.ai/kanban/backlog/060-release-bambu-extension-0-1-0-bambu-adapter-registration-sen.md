---
id: 60
title: "Release `bambu-extension@0.1.0`: Bambu adapter registration, send dialog, AMS sync, hand-off"
type: chore
priority: P1
effort: XS
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
depends_on: [50, 52, 53, 54, 57]
created: 2026-10-25
---

Publish `bambu-extension@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/bambu-extension/` (module: `bambu-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
