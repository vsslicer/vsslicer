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
sprint: "VSS:SP6"
depends_on: [3]
created: 2026-10-25
---

Domain types for objects, components, build items, transforms, materials, plates, instances, per-object config and the raw dialect blobs. Shared by every dialect reader.

**Code:** `vsslicer/modules/3mf/src/domain/project/` (module: `3mf`, layer: `domain`)

## Acceptance criteria

- [x] `Project` holds dialect, plates, objects, parts, instances, per-object config, raw project config and preserved parts
- [x] Mesh data is `Float32Array` vertices and `Uint32Array` triangles
- [x] No I/O in the folder (lint)

## Tasks

- [ ] Write the types
- [ ] Write constructor helpers
- [ ] Type tests

## Progress

Done. `src/domain/project/project.ts`: `Project` (dialect, plates, objects, instances, rawConfig, preserved parts), `ModelObject` (parts = volumes, per-object config), `ModelPart`, `Instance` (build item + plate), `Plate`, `Material`, `Transform` (12 numbers) + `IDENTITY`, `Mesh` (Float32Array / Uint32Array). Helpers `createMesh` (validates triplets and indices) and `createProject` (defaults, rejects duplicate object ids and dangling instances). Exported from `src/index.ts`. Test: `test/project.test.ts`. Verified: pnpm lint, build, test all pass in modules/3mf (13 tests). No dependency added. Folder has no I/O imports (only a type import of `Part`); lint passes. Not done: components/materials extensions detail (left to dialect reader cards).

Changelog: VWR-14: `Project`, `ModelObject`, `ModelPart`, `Instance`, `Plate`, `Mesh` and `Transform` domain types with `createMesh` and `createProject` helpers.

Review passed (vwr14-reviewer): lint, build, 35 tests green in modules/3mf; all three criteria met; folder imports only a type from ../package.ts (domain pure). Probes: createProject({plates: undefined}) overwrites the default with undefined (spread order, only on explicit undefined); Transform length, NaN vertices, instance plateId vs plates and duplicate part/plate ids are not validated. Components, per-triangle properties/paint, partnumber/UUID and p:path are not modelled; all can be added as optional fields (components flattened to parts by VWR-16 meanwhile), so no breaking change. Follow-up suggestions for VWR-15/16: drop undefined keys in createProject, decide the component representation before 16.
