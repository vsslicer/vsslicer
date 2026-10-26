---
id: 106
title: "Import .orca_printer, .orca_filament and .orca_bundle"
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US43
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [103, 136, 27, 105]
created: 2026-10-25
---

Reads Orca zip bundles into entities through the Orca reader.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/orca/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] The Orca fixture bundles import with the expected entity counts (printer, filaments, processes)
- [ ] A bundle with a missing listed file gives a diagnostic and imports the rest

## Tasks

- [ ] Write the bundle reader
- [ ] Tests

## Progress

Not started.
