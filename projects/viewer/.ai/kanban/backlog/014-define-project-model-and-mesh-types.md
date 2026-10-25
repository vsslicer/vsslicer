---
id: 14
title: "Define Project, Model and mesh types"
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US3
milestone: "VSS:M2"
depends_on: [3]
created: 2026-10-25
---

Domain types for objects, components, build items, transforms, materials, plates, instances, per-object config and the raw dialect blobs. Shared by every dialect reader.

**Code:** `vsslicer/modules/3mf/src/domain/project/` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [ ] `Project` holds dialect, plates, objects, parts, instances, per-object config, raw project config and preserved parts
- [ ] Mesh data is `Float32Array` vertices and `Uint32Array` triangles
- [ ] No I/O in the folder (lint)

## Tasks

- [ ] Write the types
- [ ] Write constructor helpers
- [ ] Type tests

## Progress

Not started.
