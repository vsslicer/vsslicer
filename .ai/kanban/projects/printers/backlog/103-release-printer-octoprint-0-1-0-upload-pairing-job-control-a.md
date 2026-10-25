---
id: 103
title: "Release `printer-octoprint@0.1.0`: upload, pairing, job control and status"
type: chore
priority: P1
effort: XS
model: sonnet
area: [octoprint]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [101, 102]
created: 2026-10-25
---

Publish `printer-octoprint@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-octoprint/` (module: `printer-octoprint`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
