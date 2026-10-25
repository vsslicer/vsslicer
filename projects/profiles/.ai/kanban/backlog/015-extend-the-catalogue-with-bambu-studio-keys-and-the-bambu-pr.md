---
id: 15
title: Extend the catalogue with Bambu Studio keys and the bambu. prefix
type: feature
priority: P0
effort: M
model: opus
area: [schema]
story: US5
milestone: "VSS:M2"
depends_on: [14]
created: 2026-10-25
---

Adds the ~100 Bambu-only keys from `BambuStudio@79df7ae` as `bambu.`-prefixed entries and maps Bambu names that differ from Orca's (`chamber_temperatures`, `machine_max_speed_*`).

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` and `vsslicer/modules/profile-api/src/domain/catalogue/data/bambu.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [ ] Every Bambu FFF key (615) is either an Orca-canonical key with a Bambu native name or a `bambu.` entry; none unassigned
- [ ] `chamber_temperature` (Orca) and `chamber_temperatures` (Bambu) are one entry with two native names
- [ ] Provenance lines for ported text name `BambuStudio@79df7ae:path`

## Tasks

- [ ] Extract Bambu keys
- [ ] Diff against the Orca set and assign prefixes
- [ ] Record native-name differences

## Progress

Not started.
