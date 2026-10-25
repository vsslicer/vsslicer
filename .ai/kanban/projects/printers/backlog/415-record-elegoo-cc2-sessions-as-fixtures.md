---
id: 415
title: Record Elegoo CC2 sessions as fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US70
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [414]
created: 2026-10-25
---

Protocol exchanges for the adapter's tests, derived from the spike document and `OrcaSlicer@09aa0114` `ElegooLink.cpp`: `GET /system/info` with `X-Token`, a chunked upload with its responses, status and a start print; the default token is a printer setting the user supplies, because no such printer is available (D5).

**Code:** `vsslicer/modules/printer-unofficial-elegoo-cc2/test/fixtures/` (module: `printer-unofficial-elegoo-cc2`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] PROVENANCE.md states for each session whether it was recorded from a device or derived from the cited source, and which firmware it applies to or that none is stated
- [ ] No vendor code is copied; anything ported under D2 carries its notice and a `Ported from` line
- [ ] The fixtures check (size cap and PROVENANCE) passes

## Tasks

- [ ] Derive or record the sessions
- [ ] PROVENANCE
- [ ] Run the fixtures check

## Progress

Not started.
