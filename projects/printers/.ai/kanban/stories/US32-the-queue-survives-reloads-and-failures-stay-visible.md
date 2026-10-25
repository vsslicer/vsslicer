---
id: US32
title: "The upload queue survives a window reload and every failure stays visible"
status: reviewed
epic: VSS:E25
---

As a user, I want the queue to survive a window reload and an agent restart and failed items to stay with their error until I dismiss them, so that nothing silently disappears.

## Acceptance criteria

- [ ] Persistence round trip; a restart while `uploading` gives `failed` with 'interrupted', or a resume where the adapter supports it
- [ ] An item whose source file vanished fails with the path named
- [ ] The queue survives a window reload (integration test)
- [ ] On the H2C (firmware recorded): a queued send of a `.gcode.3mf` while the window reloads; precision of the follow feed recorded

## Out of scope

- History records (E46).
