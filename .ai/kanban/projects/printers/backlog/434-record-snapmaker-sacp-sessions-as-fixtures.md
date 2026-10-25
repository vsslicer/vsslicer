---
id: 434
title: Record Snapmaker SACP sessions as fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [433]
created: 2026-10-25
---

Protocol exchanges for the adapter's tests, derived from the spike document and `Luban@db573f5` (`BroadcastMachineFinder.ts`, the SACP channel): the `discover` reply, SACP status and file-send frames; no machine firmware minimum is known, because no such printer is available (D5).

**Code:** `vsslicer/modules/printer-unofficial-snapmaker/test/fixtures/` (module: `printer-unofficial-snapmaker`, layer: `n/a (fixtures)`)

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
