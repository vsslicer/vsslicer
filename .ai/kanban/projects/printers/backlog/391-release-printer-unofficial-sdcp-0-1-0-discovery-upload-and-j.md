---
id: 391
title: "Release `printer-unofficial-sdcp@0.1.0`: discovery, upload and job control for SDCP"
type: chore
priority: P2
effort: XS
model: sonnet
area: [unofficial]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [390]
created: 2026-10-25
---

Publish `printer-unofficial-sdcp@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer/unofficial-sdcp/` (module: `printer-unofficial-sdcp`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
