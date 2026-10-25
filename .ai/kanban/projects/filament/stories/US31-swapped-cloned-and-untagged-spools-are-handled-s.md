---
id: US31
title: "Swapped, cloned and untagged spools are handled safely"
status: reviewed
epic: VSS:E44
---

As a user, I want a tray swap to reassign the slot and a tag that appears on two spools flagged rather than merged, so that the inventory does not go stale or merge by accident.

## Acceptance criteria

- [ ] A tray swap reassigns the slot (catches stale slots)
- [ ] The same physical tag on two spools is flagged, not silently merged
- [ ] Tag UIDs are normalised and many tags per spool are allowed, with a known `format`

## Out of scope

- Tag writing
