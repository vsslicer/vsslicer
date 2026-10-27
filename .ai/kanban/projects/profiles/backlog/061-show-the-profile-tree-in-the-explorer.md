---
id: 61
title: Show the profile tree in the Profiles container
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP14"
depends_on: [59, 60]
created: 2026-10-25
---

A `TreeView` grouped vendor, printer model, nozzle, plus materials, processes and printer instances; abstract entities greyed; inheritance chain on expand.

**Retargeted for E70 (D23, 2026-10-27):** the tree goes in its own `vsslicer-profiles` activity-bar container (title "Profiles"), contributed by `vsslicer.profiles`, not in the Explorer. Keep today's grouping: the printer, toolhead, nozzle, material and intent grouping waits for D22's profile model; no profile-entity change in this card.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/tree/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `contributes.viewsContainers.activitybar` has `vsslicer-profiles` (title "Profiles", an icon) holding the profile tree view; nothing is contributed to the `explorer` container; the extension activates on `onView`, not `*`

- [ ] Integration test on the fixture workspace: counts shown for an imported Orca vendor and for the fixture Prusa bundle equal the import golden numbers of the fixtures
- [ ] Abstract entities are greyed and not offered as selectable; expanding an entity lists its inheritance chain in order
- [ ] Tree updates when a profile file changes on disk

## Tasks

- [ ] Write the tree provider
- [ ] Abstract and chain rendering
- [ ] Integration test

## Progress

Not started.
