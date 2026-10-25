---
id: 41
title: Create the `profiles-data-orca` module with the Orca and Bambu JSON trees
type: chore
priority: P0
effort: M
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, 22]
created: 2026-10-25
---

The pinned data package (D2): Orca@09aa0114 (14 420 files) and Bambu@79df7ae (3 589 files) with their LICENSE and `source.commit`; bed models and textures are fetched on first use.

**Code:** `vsslicer/modules/profiles-data-orca/` (module: `profiles-data-orca`, layer: n/a (data package))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profiles-data-orca`; `node scripts/run.mjs ci` picks it up
- [ ] The module contains the JSON trees, `LICENSE` files, `NOTICE` and a `source.commit` file; no Prusa data
- [ ] A build script regenerates it from the pinned commits and the result is reproducible (hash test)
- [ ] File counts equal 14 420 and 3 589; size matches the size spike's decision

## Tasks

- [ ] Generate the module from the tooling template
- [ ] Write the build script
- [ ] Add LICENSE/NOTICE/source.commit
- [ ] Add the reproducibility test

## Progress

Not started.
