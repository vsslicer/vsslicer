---
id: 190
title: "Release `job-history@0.2.0`: back-fill merge and job id embedding"
type: chore
priority: P1
effort: XS
model: sonnet
area: [history]
story: US51
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [187, 188, 189]
created: 2026-10-25
---

Publish `job-history@0.2.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer/job-history/` (module: `job-history`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.2.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
