---
id: 98
title: "Release `filament@0.0.2`: entities, inventory commands and the in-memory store"
type: chore
priority: P0
effort: XS
model: sonnet
area: [model]
story: US39
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [97]
created: 2026-10-27
---

An early release so `apps/filament` can start on the in-memory store (E70) before `filament@0.1.0` (FIL-14) brings the event log, lock files and the Inventory API.

**Code:** `vsslicer/modules/filament/filament/` (module: `filament`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.0.2 and published to the local registry with `run.mjs publish` (by the coordinator, rule 21); republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball; `@vsslicer/filament/memory` resolves

## Tasks

- [ ] Changelog and version
- [ ] Publish and check

## Progress

Not started.
