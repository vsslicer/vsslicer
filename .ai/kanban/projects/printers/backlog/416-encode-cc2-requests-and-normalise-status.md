---
id: 416
title: Encode CC2 requests and normalise status
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US70
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [415]
created: 2026-10-25
---

Pure types for the CC2 info and status responses and the state mapping, written from the spike document.

**Code:** `vsslicer/modules/printer/unofficial-elegoo-cc2/src/domain/...` (module: `printer-unofficial-elegoo-cc2`, layer: `domain`)

## Acceptance criteria

- [ ] The fixtures decode to typed values; unknown states map to `unknown` with the raw value
- [ ] The token is a parameter and never appears in a URL the codec builds for logging (test)

## Tasks

- [ ] Types
- [ ] State map
- [ ] Tests

## Progress

Not started.
