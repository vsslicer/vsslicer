---
id: 201
title: "Release `project-extension@0.4.0`: plates, plate settings and layer entries"
type: chore
priority: P1
effort: XS
model: sonnet
area: [plates]
story: US49
milestone: "VSS:M4"
sprint: "VSS:SP40"
depends_on: [175, 187, 188, 189, 191, 192, 194, 195, 197, 198, 199, 184, 165]
created: 2026-10-25
---

Releases `project-extension@0.4.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so the slicer and printer extensions can use the plate API.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.4.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] The plate API types install from the registry

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
