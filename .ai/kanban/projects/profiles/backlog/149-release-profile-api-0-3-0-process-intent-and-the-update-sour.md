---
id: 149
title: "Release `profile-api@0.3.0`: process intent and the update source port"
type: chore
priority: P2
effort: XS
model: sonnet
area: [schema]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [147, 148]
created: 2026-10-25
---

Publish `profile-api@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/common/profile-api/` (module: `profile-api`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
