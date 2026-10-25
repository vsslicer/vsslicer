---
id: 118
title: Upload and start a print through the printer registry
type: feature
priority: P1
effort: S
model: sonnet
area: [tasks]
story: US23
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [100, PRN-14, PRN-28]
created: 2026-10-25
---

Use cases `uploadSliced(artefact, printerId)` and `printSliced(...)` against a `PrinterGateway` port whose real side is `PrinterRegistry` (printer-api) and whose other side is a fake.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] With a fake gateway upload and upload-plus-start call it in order
- [ ] A gateway error is returned with the printer id and the reason
- [ ] No printer-specific code appears

## Tasks

- [ ] Port
- [ ] Use cases
- [ ] Tests with fake

## Progress

Not started.
