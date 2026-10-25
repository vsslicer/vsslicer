---
id: 327
title: "Release `printer-octoprint@0.3.0`: authorised fetch"
type: chore
priority: P1
effort: XS
model: sonnet
area: [octoprint]
story: US46
milestone: "VSS:M4"
depends_on: [326]
created: 2026-10-25
---

Publish `printer-octoprint@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-octoprint/` (module: `printer-octoprint`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
