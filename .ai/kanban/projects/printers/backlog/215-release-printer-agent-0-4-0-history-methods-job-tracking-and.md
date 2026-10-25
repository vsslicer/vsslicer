---
id: 215
title: "Release `printer-agent@0.4.0`: history methods, job tracking and writer"
type: chore
priority: P1
effort: XS
model: sonnet
area: [daemon, history]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [209, 210, 211, 212, 213, 214]
created: 2026-10-25
---

Publish `printer-agent@0.4.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-agent/` (module: `printer-agent`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.4.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
