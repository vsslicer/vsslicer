---
id: 12
title: Review the API against Bambu and Moonraker sketches before freezing 0.1
type: spike
priority: P0
effort: M
model: opus
area: [api, bambu]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [1, 6, 8]
created: 2026-10-25
---

Sketch the Bambu adapter (from the PRN-1 findings) and a Moonraker adapter against the types to find where the API is wrong before 0.1 freezes.

**Code:** `vsslicer/modules/common/printer-api/docs/` (module: `printer-api`, layer: `n/a (docs)`)

## Acceptance criteria

- [ ] `docs/api-review-0.1.md` shows both adapters sketched as compiling TypeScript against the ports, and lists every type change it forced
- [ ] Each change is applied to the cards or the types; sign-off by the owner or reviewer is recorded in the note
- [ ] Decision on whether the types stay 0.x until the open adapters ship

## Tasks

- [ ] Sketch Bambu from the spike note
- [ ] Sketch Moonraker
- [ ] Record changes and sign-off

## Progress

Not started.
