---
id: 208
title: "Release `fleet-queue@0.1.0`: queue model, state machine, compatibility check, store and use cases"
type: chore
priority: P2
effort: XS
model: sonnet
area: [fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [202, 203, 204, 205, 206, 207]
created: 2026-10-25
---

Publish `fleet-queue@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/fleet-queue/` (module: `fleet-queue`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
