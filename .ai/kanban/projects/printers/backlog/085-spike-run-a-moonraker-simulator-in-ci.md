---
id: 85
title: "Spike: run a Moonraker simulator in CI"
type: spike
priority: P0
effort: S
model: opus
area: [moonraker]
story: US24
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [PLT-9]
created: 2026-10-25
---

One-day spike: can Klipper with a simulated printer and Moonraker run in a CI container to record sessions? Fallback is hand-derived fixtures.

**Code:** `vsslicer/modules/printer/moonraker/test/` (module: `printer-moonraker`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] A note records the setup that worked (or why not), the CI minutes used, and the decision
- [ ] If it works, the recording script is committed under `test/`

## Tasks

- [ ] Try Klipper simulator plus Moonraker
- [ ] Record a session
- [ ] Write the note

## Progress

Not started.
