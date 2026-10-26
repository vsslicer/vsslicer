---
id: 339
title: "Release `printers-extension@0.8.0`: Moonraker proxy, agent handle, stream download and tree context export"
type: chore
priority: P1
effort: XS
model: sonnet
area: [api]
story: "FIL:US38"
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [335, 336, 337, 338]
created: 2026-10-25
---

Publish `printers-extension@0.8.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printers-extension/` (module: `printers-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.8.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
