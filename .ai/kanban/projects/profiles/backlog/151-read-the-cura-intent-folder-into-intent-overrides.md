---
id: 151
title: Read the Cura intent folder into intent overrides
type: feature
priority: P2
effort: M
model: sonnet
area: [importers]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [150, 31]
created: 2026-10-25
---

Reads `resources/intent/**/*.inst.cfg` and attaches each block to the matching quality `process` from the quality reader, in the `ImportResult`.

**Code:** `vsslicer/modules/profiles/cura/src/adapters/...` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Golden counts at `Cura@5bea2f8`: engineering 242, visual 143, quick 139, solid 70, annealing 27, strong 7, highspeed 6, highspeedsolid 6; the one file of the 641 outside these categories is reported by path in a diagnostic and pinned by the test
- [ ] Every imported block's condition matches at least one imported quality (test); orphans are diagnostics
- [ ] The golden test skips offline with a reason and runs in CI where the Cura pack is cached

## Tasks

- [ ] Reader
- [ ] Attach to qualities
- [ ] Golden counts

## Progress

Not started.
