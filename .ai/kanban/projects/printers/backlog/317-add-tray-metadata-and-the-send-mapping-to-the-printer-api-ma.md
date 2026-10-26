---
id: 317
title: Add tray metadata and the send mapping to the printer-api material and job types
type: feature
priority: P1
effort: S
model: sonnet
area: [api]
story: "FIL:US15"
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [194]
created: 2026-10-25
---

FIL-44 and FIL-69 need per-tray data and the AMS mapping recorded at send, which `materials[]` (PRN-4) lacks.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] `materials[]` entries get optional `remainG`, `tagUid`, `trayUuid`, `trayInfoIdx`, `subBrands`, `weightG`, `diameterMm`, `nozzleTempMin`, `nozzleTempMax` (all optional, adapters that lack them leave them out)
- [ ] `PrinterStatus.job` gets an optional `materialMapping` (project filament index to tray) recorded when the job was sent by VSSlicer
- [ ] Type tests: an H2C fixture with two toolheads and a full tray compiles; the merge helper keeps the new fields (property test); api-extractor diff is additive

## Tasks

- [ ] Extend the types
- [ ] Extend merge
- [ ] Type and property tests

## Progress

Not started.
