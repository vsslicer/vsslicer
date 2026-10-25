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

- [x] Fake-channel unit tests cover ordering, chunk reassembly, backpressure, timeout with named error and version mismatch after reload
- [x] Reassembly yields identical bytes (hash) for sizes from 0 to many chunks
- [x] Chunk size is configurable

## Tasks

- [x] Write the channel interface
- [x] Implement sender, receiver and ack window
- [x] Add timeout and error types
- [x] Write property-style tests

## Progress

Done in webview-kit 0.3.0 (published locally). `src/domain/chunk.ts`, `src/application/transfer.ts`
(`sendBuffer`, `receiveBuffers`), `TimeoutError` in `src/domain/protocol.ts`, `handshake(..., { timeoutMs })`.
Chunks/acks are notifications with reserved methods and extra fields, so no schema version bump. 25 new tests
in `test/transfer.test.ts`; 81 pass; lint and build clean. Chunks are ArrayBuffer slices posted in the payload
(the Channel port has no transfer list). Defaults are unmeasured until the postMessage spike. Open: no stream
size cap, no cancel frame, no hello retry. Notes: `.reference/notes/PLT-35-chunking-transport.md`.
