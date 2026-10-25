---
id: 352
title: "Add busy keepalives, timeouts and out-of-band emergency commands"
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [350, 347]
created: 2026-10-25
---

`busy:` lines reset the watchdog; silence past the timeout ends the job with a `timeout` error; `M112`, `M108` and `M410` skip the queue and the window because Marlin's emergency parser acts on them as they arrive.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] A printer that sends `echo:busy: processing` every second for ten minutes does not time out; one that goes silent past the limit ends the job with `PrinterError` kind `timeout`
- [ ] Emergency commands are written immediately even when the window is full (test)
- [ ] Timeouts use an injectable clock in tests

## Tasks

- [ ] Watchdog
- [ ] Emergency path
- [ ] Tests

## Progress

Not started.
