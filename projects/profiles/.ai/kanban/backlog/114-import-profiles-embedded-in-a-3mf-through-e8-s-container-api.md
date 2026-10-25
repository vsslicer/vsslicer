---
id: 114
title: Read embedded config blobs from a 3MF through @vsslicer/3mf
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US47
milestone: "VSS:M2"
depends_on: [37, 135, VWR-74]
created: 2026-10-25
---

The adapter implementing `ProjectConfigSource` over `@vsslicer/3mf` (`readProject` / raw config blobs). UNRESOLVED: depends on the VWR release card for `3mf@0.2.0`, to be wired by the planner.

**Code:** `vsslicer/modules/profiles/src/adapters/threemf/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [ ] A 3MF from the `@vsslicer/3mf` fixture set with Orca `project_settings.config` yields its blob text; one with `Slic3r_PE.config` likewise
- [ ] A 3MF with no embedded config yields no blobs and no error
- [ ] `@vsslicer/3mf` is a declared semver range in `package.json`; no relative import into the 3mf module

## Tasks

- [ ] Wait for the `@vsslicer/3mf@0.2.0` release
- [ ] Implement the port over `readProject`
- [ ] Tests on the 3mf fixture set

## Progress

Not started.
