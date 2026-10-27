---
id: 430
title: "Release `printer-unofficial-anycubic@0.1.0`: LAN-mode status and job control for Anycubic"
type: chore
priority: P2
effort: XS
model: sonnet
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [429]
created: 2026-10-25
---

Publish `printer-unofficial-anycubic@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer/unofficial-anycubic/` (module: `printer-unofficial-anycubic`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
