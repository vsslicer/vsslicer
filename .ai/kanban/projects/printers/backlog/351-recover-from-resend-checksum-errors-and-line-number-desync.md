---
id: 351
title: "Recover from Resend, checksum errors and line-number desync"
type: feature
priority: P2
effort: M
model: opus
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [350]
created: 2026-10-25
---

Resend handling is where serial streamers lose prints: after `Resend: n` the streamer must rewind to line n, discard the stale `ok`s, and resynchronise with `M110` when the printer reports a line-number error.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] With a scripted link injecting bit flips, dropped characters, a `Resend:` for an old line and `Error:Line Number is not Last Line Number+1`, the lines the printer finally accepts equal the source file in order, with no line skipped or doubled (property test over random injection)
- [ ] A resend of a line older than the window ends the job with a typed `protocol` error and does not loop
- [ ] Consecutive resend limit is configurable and exceeded gives `protocol`, never an endless retry

## Tasks

- [ ] Rewind logic
- [ ] Stale ok accounting
- [ ] Resync with M110
- [ ] Property test with injected faults

## Progress

Not started.
