---
id: 409
title: Gate the Creality adapter by firmware string and fail read-only
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [408]
created: 2026-10-25
---

Vendor firmware updates break reverse-engineered protocols without notice, so the adapter checks the reported firmware string against a table of tested ones and opens read-only (status only, no upload, no job control) on any other.

**Code:** `vsslicer/modules/printer-unofficial-creality/src/application/...` (module: `printer-unofficial-creality`, layer: `application`)

## Acceptance criteria

- [ ] A tested firmware string gives full capabilities; an unknown one gives the `readOnly` annotation with a reason naming the firmware, and write calls fail with `unsupported`
- [ ] The table lives in one data file with the fixture each entry was tested against

## Tasks

- [ ] Firmware table
- [ ] Read-only mode
- [ ] Tests

## Progress

Not started.
