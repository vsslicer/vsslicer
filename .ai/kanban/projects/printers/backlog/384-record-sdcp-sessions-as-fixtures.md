---
id: 384
title: Record SDCP sessions as fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [383]
created: 2026-10-25
---

Protocol exchanges for the adapter's tests, derived from `SDCP@f977215` (the SDCP V3.0.0 document): the `M99999` reply, WebSocket status and attributes messages, response codes, a chunked upload with MD5 and the error codes. Firmware shown in the document is a placeholder, so none is claimed, because no such printer is available (D5).

**Code:** `vsslicer/modules/printer-unofficial-sdcp/test/fixtures/` (module: `printer-unofficial-sdcp`, layer: `n/a (fixtures)`)

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
