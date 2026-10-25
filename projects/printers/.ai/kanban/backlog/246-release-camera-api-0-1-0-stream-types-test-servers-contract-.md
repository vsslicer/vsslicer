---
id: 246
title: "Release `camera-api@0.1.0`: stream types, test servers, contract kit and MJPEG muxer"
type: chore
priority: P1
effort: XS
model: sonnet
area: [camera, api]
story: US40
milestone: "VSS:M4"
sprint: "VSS:SP20"
depends_on: [245, 244]
created: 2026-10-25
---

Publish `camera-api@0.1.0` so the camera modules, the agent and the extension can take the range.

**Code:** `vsslicer/modules/camera-api/` (module: `camera-api`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version 0.1.0 published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
