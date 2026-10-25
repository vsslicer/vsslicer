---
id: US55
title: "A user keeps one queue of plates across printers that two windows and extensions can use"
status: reviewed
epic: VSS:E47
---

As a owner of several printers, I want a queue of plates with a target and requirements, stored with the project or the fleet root, so that the next plate goes to a free printer without me watching, from any window.

## Acceptance criteria

- [ ] Queue items `{id, plate_ref, gcode_path, target, requires {nozzle, material, model}, state, added_at, history_id}` with states `ready, starting, paused, done, failed, cancelled`; every transition tested, illegal ones rejected
- [ ] Persisted in `.vsslicer/queue.json` of the project or of the fleet root folder; a restart mid-dispatch ends in `failed` with a reason or a resumed state, never a lost item
- [ ] The agent owns the queue: an item added in one window appears in the other and dispatches once (two-window test)
- [ ] A dispatched item gets a `history_id` and produces history records
- [ ] `Queue` (add, list, events) is exported from the printers extension for the slicer extension and dashboards
- [ ] The queue is opt-in per project; direct send keeps working

## Out of scope

- Scheduling by time.
- Cloud fleet services.
- Automatic re-slicing per target.
