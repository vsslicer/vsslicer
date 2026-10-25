---
id: 147
title: Pin a VSCodium tag and build unmodified VSCodium on linux-x64 in CI
type: feature
priority: P2
effort: M
model: opus
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [127, 9]
created: 2026-10-25
---

Proves the pinned upstream builds on a free runner and measures time and disk before our patches exist; the tag is pinned in one file.

**Code:** `.github/workflows/vsslicer-build.yml` and `vsslicer/modules/vsslicer-build/build/` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The workflow builds the pinned VSCodium tag for linux-x64 on a GitHub-hosted runner and uploads the tarball as an artifact
- [ ] Build time and disk use are recorded in `docs/build-cost.md`; if the free runner cannot finish, the result says what splits the job
- [ ] The pin file is the single source for the tag

## Tasks

- [ ] Pin the tag
- [ ] Write the workflow
- [ ] Record the cost

## Progress

Not started.
