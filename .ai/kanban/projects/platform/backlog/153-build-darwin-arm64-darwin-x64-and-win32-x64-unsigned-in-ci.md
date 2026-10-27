---
id: 153
title: "Build linux-arm64, darwin-arm64, darwin-x64 and win32-x64 unsigned in CI"
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP17"
depends_on: [152]
created: 2026-10-25
---

After linux-x64 (PLT-152): the other targets, unsigned. VSCodium's builds take 20 min (darwin-arm64), 50 min (darwin-x64) and 59 min (win32-x64) per job on GitHub runners (`docs/research/vscodium-build.md` §3).

**Code:** `.github/workflows/build.yml` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] A matrix builds linux-arm64, darwin-arm64, darwin-x64 and win32-x64 and uploads each as an artifact
- [ ] Each artifact starts on its runner and prints its version
- [ ] Times per target are added to `docs/build-cost.md`

## Tasks

- [ ] Matrix
- [ ] Start checks

## Progress

Not started.
