---
id: 35
title: "Implement chunking, ordering, backpressure and timeouts over a channel interface"
type: feature
priority: P0
effort: L
model: opus
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [34]
created: 2026-10-25
---

ArrayBuffers sent as transferables in chunks of configurable size with acknowledgement-based backpressure; named timeout error; behaviour depends on the postMessage spike outcome.

## Acceptance criteria

- [ ] Fake-channel unit tests cover ordering, chunk reassembly, backpressure, timeout with named error and version mismatch after reload
- [ ] Reassembly yields identical bytes (hash) for sizes from 0 to many chunks
- [ ] Chunk size is configurable

## Tasks

- [ ] Write the channel interface
- [ ] Implement sender, receiver and ack window
- [ ] Add timeout and error types
- [ ] Write property-style tests

## Progress

Not started.
