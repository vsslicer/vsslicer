---
id: 153
title: "Build darwin-arm64, darwin-x64 and win32-x64 unsigned in CI"
type: feature
priority: P2
effort: M
model: sonnet
area: [ci]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [152]
created: 2026-10-25
---

Adds the other three targets as unsigned CI artefacts for testing only; they are not released while signing is unfunded (D10). Fallback and unsigned local builds are what this card delivers.

**Code:** `.github/workflows/vsslicer-build.yml` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The three artefacts build on GitHub-hosted runners and are uploaded as workflow artefacts with a retention of 7 days
- [ ] The release workflow never attaches them unless the signing steps ran (test on the workflow file)
- [ ] A local unsigned build recipe for macOS and Windows is in the module README

## Tasks

- [ ] Add the three targets
- [ ] Write the guard against unsigned release
- [ ] Write the local recipe

## Progress

Not started.
