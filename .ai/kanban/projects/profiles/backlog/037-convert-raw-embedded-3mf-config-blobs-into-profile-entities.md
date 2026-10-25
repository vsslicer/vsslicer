---
id: 37
title: Import profiles embedded in a 3MF project through registered importers
type: feature
priority: P1
effort: M
model: sonnet
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [38, 136, VWR-74]
created: 2026-10-25
---

Reads the embedded config blobs of a 3MF (`Metadata/project_settings.config`, PrusaSlicer `Slic3r_PE.config`) through a `ProjectConfigSource` port and routes each blob to the registered importer for its dialect. NOTE: needs `@vsslicer/3mf@0.2.0` (raw config blobs) for the real source in PRF-114; wired once the VWR release card exists.

**Code:** `vsslicer/modules/profiles/src/application/embedded/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With a fake `ProjectConfigSource` and fake importers, an Orca blob and a Prusa blob are each routed to the importer of their dialect and the results merge
- [ ] A project with no embedded config returns an empty result and an info diagnostic
- [ ] The port has two real sides: the 3MF adapter (PRF-114) and the fake used in tests

## Tasks

- [ ] Define the ProjectConfigSource port
- [ ] Route blobs to importers by dialect
- [ ] Tests with fakes

## Progress

Not started.
