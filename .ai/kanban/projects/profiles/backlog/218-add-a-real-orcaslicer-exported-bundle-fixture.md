---
id: 218
title: Add a real OrcaSlicer-exported bundle fixture
type: chore
priority: P2
effort: S
model: sonnet
area: [importers]
sprint: "VSS:SP29"
depends_on: [105]
created: 2026-10-26
---

PRF-105 shipped documented-layout bundles and a Bambu Studio preset bundle zipped by our writer; no bundle exported by OrcaSlicer's own dialog exists on this machine (see `vsslicer/modules/profiles-orca/test/fixtures/bundles/PROVENANCE.md`). Waits on the owner's answer to the question asked on PRF-105.

**Code:** `vsslicer/modules/profiles-orca/test/fixtures/bundles/` (module: `profiles-orca`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] A `.orca_printer` or `.orca_bundle` exported from OrcaSlicer 2.x by the owner is checked in under `orca-saved/` with its provenance
- [ ] The fixture-bundles test covers it, and PRF-106's importer reads it

## Progress

Not started.
