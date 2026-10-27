---
id: 163
title: Write the upload queue state machine and retry policy
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US31
milestone: "VSS:M3"
sprint: "VSS:SP24"
depends_on: [62]
created: 2026-10-25
---

Items `{id, file, printer, dest, startAfter, state, progress, error}`, states `queued, uploading, done, failed, cancelled`, FIFO per printer, and retry by error kind.

**Code:** `vsslicer/modules/printer/agent/src/domain/...` (module: `printer-agent`, layer: `domain`)

## Acceptance criteria

- [ ] Every transition tested; illegal transitions rejected
- [ ] Retry: `unreachable` and `timeout` back off up to the limit; `auth` and `fileRejected` fail at once; fake-clock tests

## Tasks

- [ ] State machine
- [ ] Retry policy
- [ ] Tests

## Progress

Not started.
