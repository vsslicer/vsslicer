---
id: 93
title: Write the Orca capability table
type: feature
priority: P0
effort: M
model: opus
area: [orca, engine]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [92, 42]
created: 2026-10-25
---

One entry per unified key. Orca names are canonical (D9) so most are identity `supported`; Bambu-only and prefixed keys, and the keys Orca lacks, are judged one by one. Hand-maintained JSON checked by tests, not inferred from engine help.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] The table validates and covers every key in PRF's catalogue (coverage check run against the catalogue package); no entry is unreviewed
- [ ] Every `renamed` entry is applied by the emitter (test)
- [ ] The 10 P0/P1 rows of section 2 have explicit entries with a note on the native key and values

## Tasks

- [ ] Generate the skeleton from the catalogue
- [ ] Review every non-identity entry
- [ ] Wire `capabilities()` into `OrcaEngine`

## Progress

Not started.
