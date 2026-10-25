---
id: 44
title: "Write the QOI, PNG and JPEG thumbnail encoders"
type: feature
priority: P1
effort: S
model: sonnet
area: [engine]
story: US11
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [43]
created: 2026-10-25
---

Pure encoders from RGBA pixels. A test-only decoder checks lossless round trips.

**Code:** `vsslicer/modules/slicer-output/src/domain/...` (module: `slicer-output`, layer: `domain`)

## Acceptance criteria

- [ ] QOI and PNG decode back to the exact input pixels; JPEG decodes within a stated tolerance
- [ ] Encoded sizes are deterministic (same input, same bytes)
- [ ] Zero-size and oversize images give a typed error

## Tasks

- [ ] QOI encoder
- [ ] PNG and JPEG encoders
- [ ] Round-trip tests

## Progress

Not started.
