---
id: 167
title: Release unsigned Linux builds as GitHub releases
type: feature
priority: P2
effort: M
model: sonnet
area: [publishing]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [165, 166, 146, 154, 25]
created: 2026-10-25
---

The release job for tags `vsslicer-build@x.y.z`: Linux artefacts, checksums, notices and source tarball attached to a GitHub release; unsigned Linux builds are allowed by D10. macOS and Windows are not attached.

**Code:** `.github/workflows/vsslicer-build.yml` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] A test tag produces a GitHub release with both Linux artefacts, sha256 sums, notices and the source tarball
- [ ] The job refuses to run without the trademark record (PLT-146) and without green smoke tests
- [ ] Re-running the job is idempotent

## Tasks

- [ ] Write the job
- [ ] Test with a pre-release tag

## Progress

Not started.
