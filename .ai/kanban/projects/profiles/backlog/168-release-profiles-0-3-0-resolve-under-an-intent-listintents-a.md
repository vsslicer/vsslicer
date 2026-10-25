---
id: 168
title: "Release `profiles@0.3.0`: resolve under an intent, listIntents and the intent form field"
type: chore
priority: P2
effort: XS
model: sonnet
area: [store]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [166, 167]
created: 2026-10-25
---

Publish `profiles@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/profiles/` (module: `profiles`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
