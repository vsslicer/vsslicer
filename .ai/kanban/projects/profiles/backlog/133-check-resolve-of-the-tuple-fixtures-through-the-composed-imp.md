---
id: 133
title: Check resolve of the tuple fixtures through the composed importers
type: feature
priority: P0
effort: L
model: opus
area: [store]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [59, 138, 139, 137, 145]
created: 2026-10-25
---

The end-to-end check that the core with the three ecosystem adapters resolves the same tuples as the oracle; the composition root is the only place all of them meet.

**Code:** `vsslicer/modules/apps/profiles/test/integration/` (module: `profiles-extension`, layer: `presentation`, integration test)

## Acceptance criteria

- [ ] Importing the pinned packs through the registered adapters and calling `resolve` gives the oracle values for the tuples of each adapter module, including the H2C 0.4 nozzle + Bambu PLA Basic + 0.20 mm Standard tuple, with provenance
- [ ] A seeded wrong registration (adapter missing) fails the test with a named error
- [ ] Fixtures only (D5)

## Tasks

- [ ] Compose the adapters in a test harness
- [ ] Run the tuple tables
- [ ] Seeded failure

## Progress

Not started.
