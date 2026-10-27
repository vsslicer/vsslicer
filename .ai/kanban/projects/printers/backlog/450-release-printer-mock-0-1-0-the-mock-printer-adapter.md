---
id: 450
title: "Release `printer-mock@0.1.0`: the mock printer adapter"
type: chore
priority: P0
effort: XS
model: sonnet
area: [api]
story: US75
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [449]
created: 2026-10-27
---

Publish `printer-mock@0.1.0` so `printers-extension` can take it by semver range.

**Code:** `vsslicer/modules/printer/mock/` (module: `printer-mock`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish` (by the coordinator, rule 21); republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Changelog and version
- [ ] Publish and check

## Progress

Not started.
