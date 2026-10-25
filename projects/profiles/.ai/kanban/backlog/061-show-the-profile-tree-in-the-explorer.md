---
id: 61
title: Show the profile tree in the explorer
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US25
milestone: "VSS:M2"
depends_on: [59, 60]
created: 2026-10-25
---

A `TreeView` grouped vendor, printer model, nozzle, plus materials, processes and printer instances; abstract entities greyed; inheritance chain on expand.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/tree/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Integration test on the fixture workspace: counts shown for an imported Orca vendor and for the fixture Prusa bundle equal the import golden numbers of the fixtures
- [ ] Abstract entities are greyed and not offered as selectable; expanding an entity lists its inheritance chain in order
- [ ] Tree updates when a profile file changes on disk

## Tasks

- [ ] Write the tree provider
- [ ] Abstract and chain rendering
- [ ] Integration test

## Progress

Not started.
