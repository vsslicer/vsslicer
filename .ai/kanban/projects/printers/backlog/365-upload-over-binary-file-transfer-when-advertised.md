---
id: 365
title: Upload over Binary File Transfer when advertised
type: feature
priority: P2
effort: M
model: opus
area: [serial]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [364, 363, 354]
created: 2026-10-25
---

Uses the binary protocol for SD upload when `M115` reports `BINARY_FILE_TRANSFER`, falling back to `M28` text mode otherwise, with the emulator speaking the binary protocol too.

**Code:** `vsslicer/modules/printer-serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] The emulator's card holds the source bytes after a binary upload with injected packet corruption and retransmission
- [ ] A printer that does not advertise the capability gets the text path (test); a printer that advertises it but fails the ping falls back with a logged reason
- [ ] Throughput against text mode on the emulator is recorded in the README (no hardware claim)

## Tasks

- [ ] Emulator binary mode
- [ ] Upload use case
- [ ] Fallback
- [ ] Tests

## Progress

Not started.
