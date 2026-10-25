---
id: US35
title: "Keep the local inventory and Spoolman in two-way sync"
status: reviewed
epic: VSS:E45
---

As a user sharing a Spoolman with Fluidd, Mainsail or OctoPrint, I want edits and consumption synced both ways with deltas rather than overwrites, so that usage from every client adds up.

## Acceptance criteria

- [ ] Spoolman receives `use` from VSSlicer and from a second simulated client; both deltas are in the final `used_weight`
- [ ] Changes to `used_weight` by other clients arrive as `extrusion` events marked external
- [ ] The same field edited on both sides appears in the conflict list with both values; deletes in Spoolman archive the local spool

## Out of scope

- Spoolman credentials
