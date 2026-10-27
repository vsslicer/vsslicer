---
id: 343
title: "Release `printer-api@0.5.0`: the `longFilenames` capability"
type: chore
priority: P2
effort: XS
model: sonnet
area: [api]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [342]
created: 2026-10-25
---

Publish `printer-api@0.5.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/common/printer-api/` (module: `printer-api`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.5.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
