---
id: 95
title: "Release `3mf@0.7.1`: browser path free of Node built-ins"
type: chore
priority: P2
effort: XS
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [94, VWR-170, VWR-299]
created: 2026-10-25
---

Publish `3mf@0.7.1` so dependent modules can take the range.

**Code:** `vsslicer/modules/3mf/` (module: `3mf`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.7.1 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
