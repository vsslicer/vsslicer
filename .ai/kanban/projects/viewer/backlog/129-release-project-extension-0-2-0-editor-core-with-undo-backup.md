---
id: 129
title: "Release `project-extension@0.2.0`: editor core with undo, backup and project folder"
type: chore
priority: P1
effort: XS
model: sonnet
area: [editor]
story: US35
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [103, 105, 107, 125, 110, 111, 112, 114, 120, 121, 124, 128]
created: 2026-10-25
---

Releases `project-extension@0.2.0`: the editing core. Bumps the version, writes the changelog entry, builds the VSIX and publishes to the local registry with `node scripts/run.mjs publish`, so other extensions can depend on the exported types.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (release))

## Acceptance criteria

- [ ] `project-extension@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] The exported types install from the registry in a scratch consumer

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
