---
id: 438
title: Assemble the Snapmaker adapter with a firmware gate
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [435, 436, 437]
created: 2026-10-25
---

Composes discovery, status, upload and start into the `snapmaker-sacp` adapter; the firmware table decides read-only mode.

**Code:** `vsslicer/modules/printer-unofficial-snapmaker/src/application/...` (module: `printer-unofficial-snapmaker`, layer: `application`)

## Acceptance criteria

- [ ] Upload then start reaches `printing` on the fixtures; CNC and laser file types are refused with `unsupported`
- [ ] An unknown firmware opens read-only with the reason; the descriptor carries the `reverse engineered` label

## Tasks

- [ ] Descriptor
- [ ] Start
- [ ] Firmware gate
- [ ] Tests

## Progress

Not started.
