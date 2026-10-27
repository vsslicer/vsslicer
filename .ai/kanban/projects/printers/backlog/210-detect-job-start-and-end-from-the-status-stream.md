---
id: 210
title: Detect job start and end from the status stream
type: feature
priority: P1
effort: M
model: opus
area: [daemon, history]
story: US50
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [168, 186]
created: 2026-10-25
---

Derive `started` and `ended` events (with vendor end state and filament used) from status transitions, matched to the upload record for the file.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Fixture status streams: Moonraker complete, cancel and error; Bambu FINISH and FAILED; an agent restart mid-job emits `ended` with `interrupted` rather than losing the job
- [ ] A job started elsewhere (no upload record) emits events without project links

## Tasks

- [ ] Transition detector
- [ ] Upload record lookup
- [ ] Tests

## Progress

Not started.
