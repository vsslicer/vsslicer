---
id: 167
title: Derive the follow feed from status and upload records
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US33
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [166]
created: 2026-10-25
---

Turn the position in the status into `{fileName, fileUri?, byteOffset, layer?, progress, state}` events, mapping the printer's file to a local URI via upload records.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Offsets monotonic during a job, reset on a new job, null when unknown; file name match maps to the local URI of a file sent from this machine
- [ ] Feed events published on the `printer.follow` topic with sequence numbers

## Tasks

- [ ] Derivation
- [ ] Upload record lookup
- [ ] Tests

## Progress

Not started.
