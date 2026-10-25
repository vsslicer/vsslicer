---
id: 440
title: "Release `printer-unofficial-snapmaker@0.1.0`: SACP discovery, status, upload and start for Snapmaker"
type: chore
priority: P2
effort: XS
model: sonnet
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [439]
created: 2026-10-25
---

Publish `printer-unofficial-snapmaker@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-unofficial-snapmaker/` (module: `printer-unofficial-snapmaker`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
