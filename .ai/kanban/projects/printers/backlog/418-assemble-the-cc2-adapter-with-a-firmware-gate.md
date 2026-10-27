---
id: 418
title: Assemble the CC2 adapter with a firmware gate
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US70
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [417]
created: 2026-10-25
---

Composes info, status, upload and start into the `elegoo-cc2` adapter. Only operations the spike verified are offered; the firmware table decides read-only mode.

**Code:** `vsslicer/modules/printer/unofficial-elegoo-cc2/src/application/...` (module: `printer-unofficial-elegoo-cc2`, layer: `application`)

## Acceptance criteria

- [ ] Upload then start reaches `printing` on the fixtures
- [ ] An unknown firmware opens read-only with the reason; operations marked unknown by the spike are absent from the capabilities
- [ ] The descriptor carries the `reverse engineered` label

## Tasks

- [ ] Descriptor
- [ ] Start
- [ ] Firmware gate
- [ ] Tests

## Progress

Not started.
