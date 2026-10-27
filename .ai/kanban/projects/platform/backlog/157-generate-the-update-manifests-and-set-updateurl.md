---
id: 157
title: Generate the update manifests and set `updateUrl`
type: feature
priority: P1
effort: M
model: sonnet
area: [fork]
story: US66
milestone: "VSS:M6"
sprint: "VSS:SP18"
depends_on: [156, 148]
created: 2026-10-25
---

Generates the per-platform update manifests from release assets so a new GitHub release is offered to older builds.

**Code:** `src/application/update-manifest.ts` (repo: `vsslicer/vsslicer-build`, layer: `application`)

## Acceptance criteria

- [ ] `makeManifest(release)` returns the shape the spike recorded, with the asset URL and sha256 per platform; unit tests cover Linux and the signed-only platforms
- [ ] Platforms without signed assets are omitted from the manifest (so unsigned macOS/Windows are never offered)
- [ ] `updateUrl` in the overlay points at the manifest location

## Tasks

- [ ] Write the manifest function and tests
- [ ] Wire `updateUrl` into the overlay

## Progress

Not started.
