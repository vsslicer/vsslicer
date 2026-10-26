---
id: 124
title: "Release `printer-discovery@0.1.0`: mDNS, SSDP and probed discovery"
type: chore
priority: P1
effort: XS
model: sonnet
area: [discovery]
story: US23
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [123]
created: 2026-10-25
---

Publish `printer-discovery@0.1.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/printer-discovery/` (module: `printer-discovery`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
