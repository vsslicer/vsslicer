---
id: 43
title: Read Moonraker filament_used per tool as a usage observation
type: feature
priority: P1
effort: M
model: sonnet
area: [consumption]
story: US14
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [39, PRN-93, PRN-320, PRN-325]
created: 2026-10-25
---

Turn `print_stats.filament_used` (and job history per tool when present) delivered through printer-api into source observations in grams, using the filament's diameter and density.

UNRESOLVED: needs printer-moonraker (and printer-api): the job's `filament_used` per tool at job end exposed to consumers.

**Code:** `vsslicer/modules/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] Recorded Moonraker job ends (PRN-87 recordings, copied with provenance) give the expected grams per tool via the length-to-grams conversion
- [ ] A missing density surfaces the typed error and books nothing
- [ ] Verified on recorded fixtures only (D5)

## Tasks

- [ ] Write the source
- [ ] Fixture tests

## Progress

Not started.
