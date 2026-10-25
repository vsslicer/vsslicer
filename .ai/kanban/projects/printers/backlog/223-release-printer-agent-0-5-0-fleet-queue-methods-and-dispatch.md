---
id: 223
title: "Release `printer-agent@0.5.0`: fleet queue methods and dispatch"
type: chore
priority: P2
effort: XS
model: sonnet
area: [daemon, fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [216, 217, 218, 219, 220, 221, 222]
created: 2026-10-25
---

Publish `printer-agent@0.5.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-agent/` (module: `printer-agent`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.5.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
