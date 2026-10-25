---
id: 253
title: "Release `printer-agent@0.4.0`: camera methods, loader and loopback proxy"
type: chore
priority: P1
effort: XS
model: sonnet
area: [camera, daemon]
story: US41
milestone: "VSS:M4"
depends_on: [252, 248]
created: 2026-10-25
---

Publish `printer-agent@0.4.0` so the camera extension can drive streams through the agent.

**Code:** `vsslicer/modules/printer-agent/` (module: `printer-agent`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version 0.4.0 published to the local registry with `run.mjs publish`; republishing is skipped
- [ ] A clean install, test and build passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
