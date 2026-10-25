---
id: 89
title: "Release `webview-kit@0.2.0`: worker shim and browser-safe host entry"
type: chore
priority: P2
effort: XS
model: sonnet
area: [web]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [87, 88]
created: 2026-10-25
---

Publish `webview-kit@0.2.0` so dependent modules can take the range.

**Code:** `vsslicer/modules/webview-kit/` (module: `webview-kit`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.2.0 and published to the local registry with `run.mjs publish`; republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball

## Tasks

- [ ] Write the changelog
- [ ] Bump the version
- [ ] Publish with `run.mjs publish`

## Progress

Not started.
