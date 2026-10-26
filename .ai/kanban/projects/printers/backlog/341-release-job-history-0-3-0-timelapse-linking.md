---
id: 341
title: "Release `job-history@0.3.0`: timelapse linking"
type: chore
priority: P1
effort: XS
model: sonnet
area: [history]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [340]
created: 2026-10-25
---

Publish `job-history@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/job-history/` (module: `job-history`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
