---
id: 146
title: Offer the registered printer host types in the instance form
type: feature
priority: P1
effort: S
model: sonnet
area: [store]
story: US34
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [88, PRN-26]
created: 2026-10-25
---

Replace the static `host_type` list in the instance form with the adapters `vsslicer.printers` registers, once E20's registry exists.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/instances/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The instance create and edit form offers the host types returned by `vsslicer.printers` `hostTypes()`, with their labels
- [ ] Without `vsslicer.printers` installed, the form falls back to the static D3 list from `profile-api` and says so once
- [ ] An instance whose `host_type` is no longer registered shows a warning in the tree instead of failing to load
- [ ] Integration test with a stub `vsslicer.printers` exporting two host types

## Tasks

- [ ] Read `hostTypes()` through the extension API, with the static fallback
- [ ] Warn on unregistered host types in the tree
- [ ] Integration test

## Progress

Not started.
