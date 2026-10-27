---
id: 30
title: "Record an H2C session: push_status, fun flag, CA chain and accepted commands"
type: chore
priority: P1
effort: M
model: opus
area: [bambu]
story: US7
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [29]
created: 2026-10-25
---

Owner-assisted capture on the H2C so adapter code is not written against guesses (`bambu-connectivity.md` open questions). Also the oracle for GCP-49's position-field spike.

**Code:** `vsslicer/modules/printer/bambu/test/fixtures/h2c/` (module: `printer-bambu`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] A capture file set (firmware version and date recorded) with `push_status` frames during a print, the `fun` flag, the printer's CA chain and the commands the printer accepted, stored as fixtures with a PROVENANCE note
- [ ] Secrets (access code, serial where needed) are scrubbed and a script test checks the fixtures hold none

## Tasks

- [ ] Write the capture script
- [ ] Capture with the owner
- [ ] Scrub and add PROVENANCE

## Progress

Not started.
