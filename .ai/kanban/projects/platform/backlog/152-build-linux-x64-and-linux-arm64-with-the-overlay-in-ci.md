---
id: 152
title: Build linux-x64 with the overlay and patches in CI
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [149, 150]
created: 2026-10-25
---

The first VSSlicer build: linux-x64 only (owner: Linux first), from the prepared sources, as a CI artifact. macOS, Windows and linux-arm64 follow in PLT-153.

**Code:** `.github/workflows/build.yml` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] On push to `main` and on manual dispatch the workflow fetches the pin, runs `pnpm prepare-sources` and builds `vsslicer-linux-x64.tar.gz`
- [ ] The artifact starts on a GitHub-hosted Ubuntu runner under `xvfb` and prints its version (`--version`)
- [ ] npm and Electron downloads are cached; cold and warm build times are added to `docs/build-cost.md`

## Tasks

- [ ] Workflow job
- [ ] Cache
- [ ] Record times

## Progress

Not started.
