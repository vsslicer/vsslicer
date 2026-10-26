---
id: 321
title: Record a Moonraker session with the spoolman component
type: chore
priority: P2
effort: XS
model: sonnet
area: [moonraker]
story: "FIL:US37"
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [87]
created: 2026-10-25
---

A recorded session from a Moonraker with `[spoolman]` enabled, for the proxy and active-spool tests.

**Code:** `vsslicer/modules/printer-moonraker/test/fixtures/` (module: `printer-moonraker`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] Recording under `test/fixtures/` with `PROVENANCE.md` (Moonraker commit, config, date): `server/info` with `spoolman` in `components`, `/server/spoolman/status`, `/server/spoolman/proxy` request and response pairs, `server/spoolman/spool_id` get and post
- [ ] Replays through the printer-api replay harness (`printer-api@0.2.0`); no real printer or Spoolman needed (D5)

## Tasks

- [ ] Record the exchanges
- [ ] Add the provenance file
- [ ] Replay smoke test

## Progress

Not started.
