---
id: 72
title: "Decode OpenPrintTag regions with bounds, typed errors and unknown-key preservation"
type: feature
priority: P2
effort: M
model: opus
area: [tags]
story: US32
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [71, 67]
created: 2026-10-25
---

The NDEF payload `application/vnd.openprinttag`: meta, main and aux regions with integer keys, decoded through the chosen CBOR decoder with size and depth limits; unknown keys preserved.

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] The spec repository's example payloads decode and a round trip preserves unknown keys
- [ ] Malformed CBOR, oversize regions and a missing main region return typed errors; a fast-check fuzz test never throws untyped or hangs
- [ ] Payload bytes are treated as untrusted; limits are asserted

## Tasks

- [ ] Write the framing
- [ ] Write the decoder
- [ ] Fuzz and example tests

## Progress

Not started.
