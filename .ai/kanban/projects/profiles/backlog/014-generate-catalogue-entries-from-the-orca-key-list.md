---
id: 14
title: Generate catalogue entries from the Orca key list
type: feature
priority: P0
effort: L
model: opus
area: [schema]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [12, PLT-13]
created: 2026-10-25
---

A script that reads `OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp` and emits one canonical entry for each of Orca's 804 FFF keys (D9), with type, default, bounds, enum and our own label; Orca/Bambu labels and tooltips may be ported with a provenance line per entry (D2).

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` writing `vsslicer/modules/profile-api/src/domain/catalogue/data/orca.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [ ] The script is deterministic: running it twice gives identical output; it reads the upstream file from `.reference/` or a pinned download and never runs upstream build scripts
- [ ] Output has 804 entries with a type and default each; every ported text has a `Ported from OrcaSlicer@09aa0114:path` line and the AGPL notice header is in the file
- [ ] Entries validate against the E11 catalogue entry type
- [ ] Verified on pinned sources only (D5)

## Tasks

- [ ] Write the PrintConfig.cpp extractor
- [ ] Map option types to catalogue types and units
- [ ] Write labels and tooltips (ported with provenance or new)
- [ ] Add the determinism test

## Progress

Not started.
