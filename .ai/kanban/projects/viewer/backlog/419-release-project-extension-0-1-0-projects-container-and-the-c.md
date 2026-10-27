---
id: 419
title: "Release `project-extension@0.1.0`: Projects container and the current project API"
type: chore
priority: P0
effort: XS
model: sonnet
area: [editor]
story: US99
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [415]
created: 2026-10-27
---

Publish `project-extension@0.1.0` so `printers-extension` and `profiles-extension` can take the `CurrentProjectApi` types by semver range.

**Code:** `vsslicer/modules/apps/project/` (module: `project-extension`, layer: `n/a (release)`)

## Acceptance criteria

- [ ] CHANGELOG entry, version bumped to 0.1.0 and published to the local registry with `run.mjs publish` (by the coordinator, rule 21); republishing the same version is skipped, never overwritten
- [ ] A clean `pnpm install && pnpm test && pnpm build` passes against the published tarball, and `@vsslicer/project-extension/api` resolves to the type declarations

## Tasks

- [ ] Changelog and version
- [ ] Publish and check

## Progress

Not started.
