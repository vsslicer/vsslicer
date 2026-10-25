---
id: 60
title: Create the fixture workspace and per-OS slicer configuration folders
type: chore
priority: P0
effort: M
model: sonnet
area: [store]
story: US26
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [57, PLT-13]
created: 2026-10-25
---

Fixture workspaces for the extension's integration tests: an imported Orca vendor, a fixture Prusa bundle, and slicer configuration folders for the macOS, Windows and Linux layouts.

**Code:** `vsslicer/modules/profiles-extension/test/fixtures/` (module: `profiles-extension`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Fixtures pass the PLT fixtures check (size cap, PROVENANCE.md)
- [ ] Each OS layout fixture contains user presets for all five slicers (small hand-built files citing the real layout)

## Tasks

- [ ] Build the fixtures
- [ ] Write PROVENANCE.md

## Progress

Not started.
