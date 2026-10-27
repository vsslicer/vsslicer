---
id: 99
title: Activate vsslicer.filament on the in-memory store with the Filaments container
type: feature
priority: P0
effort: M
model: sonnet
area: [ui]
story: US39
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [15]
created: 2026-10-27
---

The E70 counterpart of FIL-16: activation, the output channel and the `vsslicer-filaments` activity-bar container (D23), on the in-memory store from `@vsslicer/filament/memory`. FIL-16 later swaps in the file store in `globalStorageUri` and adds its fault warnings; it stays in its sprint.

**Code:** `vsslicer/modules/apps/filament/src/presentation/extension.ts` and `package.json` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `contributes.viewsContainers.activitybar` has `vsslicer-filaments` (title "Filaments", an icon) with the view id `vsslicer.filament.spools` (filled by FIL-52); welcome content while the store is empty offers Add spool
- [ ] Activation opens `createMemoryInventory()` (with a small seed when `vsslicer.filament.demoData` is true, default false; the VSSlicer profile may turn it on) and exports `{ inventory }` with the FIL-5 use cases
- [ ] Activates on `onView:vsslicer.filament.spools`, not on `*`; `extensionKind` stays `["ui", "workspace"]`
- [ ] Integration test (`pnpm test:integration`): the extension activates, the container and view are registered and `exports.inventory` creates and lists a spool
- [ ] The VSIX passes the content assertion

## Tasks

- [ ] Container, view id and welcome content
- [ ] Activation and exports
- [ ] Integration test

## Progress

Not started.
