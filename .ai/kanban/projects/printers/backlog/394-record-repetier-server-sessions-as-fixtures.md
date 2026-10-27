---
id: 394
title: Record Repetier-Server sessions as fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US68
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [393]
created: 2026-10-25
---

Protocol exchanges for the adapter's tests, derived from the Repetier-Server API documentation (https://www.repetier-server.com/manuals/programming/API/index.html; licence terms unverified) and the client in `PrusaSlicer@30ef591` `PrintHostRepetier.cpp:72-84`: `listPrinter`, `stateList`, state and temperature events, `listModels`, `copyModel`, `startJob`, `stopJob`, and the upload response, because no such printer is available (D5).

**Code:** `vsslicer/modules/printer/unofficial-repetier/test/fixtures/` (module: `printer-unofficial-repetier`, layer: `n/a (fixtures)`)

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
