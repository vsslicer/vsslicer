---
id: 359
title: Stream a file as a print job with progress
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [357, 351]
created: 2026-10-25
---

`upload` with start streams the file through the streamer: progress by bytes sent, abort through `AbortSignal`, completion when the last `ok` returns, and the job state reaches `PrinterStatus`.

**Code:** `vsslicer/modules/printer/serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] A 20 MB synthetic file streams to the emulator with injected faults; the emulator's received lines equal the file's lines
- [ ] Aborting stops within one line and leaves the printer idle; the job ends with the right outcome
- [ ] Memory use is bounded: the file is read as a stream, never loaded whole (test with a size-capped heap)

## Tasks

- [ ] Job runner
- [ ] Progress
- [ ] Abort
- [ ] Tests

## Progress

Not started.
