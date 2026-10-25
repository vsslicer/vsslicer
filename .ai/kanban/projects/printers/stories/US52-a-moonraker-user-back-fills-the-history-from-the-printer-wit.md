---
id: US52
title: "A Moonraker user back-fills the history from the printer without duplicates"
status: reviewed
epic: VSS:E46
---

As a user who also starts prints from Fluidd or Mainsail, I want to import the printer's own job history on demand, so that jobs not started from VSSlicer show up in the history too.

## Acceptance criteria

- [ ] An optional command reads `server/history/list` and writes back-filled records (Moonraker fixtures)
- [ ] A back-filled job that matches a sent job by printer plus `start_time` merges into it, never duplicates (test)
- [ ] Running the command twice adds nothing the second time
- [ ] Printers without a native history say so and offer nothing

## Out of scope

- Bambu cloud history (needs a cloud login, outside D3 scope).
- OctoPrint history (core has none).
