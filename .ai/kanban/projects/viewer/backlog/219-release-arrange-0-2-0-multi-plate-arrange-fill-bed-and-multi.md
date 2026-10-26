---
id: 219
title: "Release `arrange@0.2.0`: multi-plate arrange, fill bed and multiply"
type: chore
priority: P1
effort: XS
model: sonnet
area: [arrange]
story: US61
milestone: "VSS:M4"
sprint: "VSS:SP40"
depends_on: [215, 216, 217, 218, 214]
created: 2026-10-25
---

Releases `arrange@0.2.0`. Bumps the version, writes the changelog entry and publishes to the local registry with `node scripts/run.mjs publish`, so the editor, the slicer extension and the fleet queue can depend on the range.

**Code:** `vsslicer/modules/arrange/` (module: `arrange`, layer: n/a (release))

## Acceptance criteria

- [ ] `arrange@0.2.0` is in the local registry and its changelog lists the increment
- [ ] `pnpm install && pnpm test && pnpm build` passes alone inside the module
- [ ] A consumer module can install the range `^0.2.0`

## Tasks

- [ ] Changelog and version bump
- [ ] `run.mjs publish`
- [ ] Install check

## Progress

Not started.
