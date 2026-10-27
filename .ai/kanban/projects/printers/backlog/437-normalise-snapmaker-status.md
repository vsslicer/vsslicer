---
id: 437
title: Normalise Snapmaker status
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [434]
created: 2026-10-25
---

Pure mapping from the SACP status values the fixtures show to `PrinterStatus`, with the machine type kept.

**Code:** `vsslicer/modules/printer/unofficial-snapmaker/src/domain/...` (module: `printer-unofficial-snapmaker`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture statuses map for idle, printing, paused and error; unknown values give `unknown` with the raw value

## Tasks

- [ ] Types
- [ ] Mapping
- [ ] Tests

## Progress

Not started.
