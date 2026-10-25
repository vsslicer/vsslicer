---
id: 168
title: "Release `printer-agent@0.3.0`: upload queue and follow feed"
type: chore
priority: P1
effort: XS
model: sonnet
area: [daemon]
story: US31
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [167, 166]
created: 2026-10-25
---

Publish `printer-agent@0.3.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-agent/` (module: `printer-agent`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.3.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
