---
id: 364
title: Encode and decode Binary File Transfer packets
type: feature
priority: P2
effort: M
model: opus
area: [serial]
story: US62
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [348]
created: 2026-10-25
---

Pure codec for the packet format of Marlin's binary file transfer (`Marlin@2ef3ee6:Marlin/src/feature/binary_stream.h`, `binary_stream.cpp`; read, not copied): sync, header, payload, CRC16, the ping/open/write/close/abort packet types and the printer's responses.

**Code:** `vsslicer/modules/printer/serial/src/domain/...` (module: `printer-serial`, layer: `domain`)

## Acceptance criteria

- [ ] Encode then decode round trips for every packet type; a corrupted CRC, a wrong sync and a truncated packet each give a typed error (property test with random corruption)
- [ ] Golden packets derived by hand from the header file's layout match byte for byte
- [ ] Compression is not implemented; the module README says so and that uncompressed packets are valid

## Tasks

- [ ] Packet types
- [ ] CRC16
- [ ] Codec and tests

## Progress

Not started.
