---
id: 11
title: Add upload and follow-position checks to the contract kit
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [10]
created: 2026-10-25
---

The second half of the kit: uploads and the live-follow position rules.

**Code:** `vsslicer/modules/printer-api/src/adapters/testing/` (module: `printer-api`, layer: `adapters`)

## Acceptance criteria

- [ ] Upload with progress events and abort (the fake server sees the connection closed); a corrupt-file reply gives `fileRejected`
- [ ] Follow rules: `byteOffset` monotonic during a job, reset on a new job, null when unknown
- [ ] The checks pass for the fake and fail for a broken fake

## Tasks

- [ ] Upload checks
- [ ] Follow-position checks
- [ ] Meta tests

## Progress

Not started.
