---
id: 186
title: "Release `job-history@0.1.0`: record, store, queries and status mapping"
type: chore
priority: P1
effort: XS
model: sonnet
area: [history]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [182, 183, 184, 185]
created: 2026-10-25
---

Publish `job-history@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/job-history/` (module: `job-history`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
