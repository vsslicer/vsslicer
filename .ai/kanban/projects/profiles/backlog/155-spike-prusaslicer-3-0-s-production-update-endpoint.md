---
id: 155
title: "Spike: PrusaSlicer 3.0's production update endpoint"
type: spike
priority: P2
effort: S
model: opus
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [154]
created: 2026-10-25
---

`RepositoryManifest.json` in 3.0 points at localhost, so the production endpoint is unknown. When PrusaSlicer 3.0 ships, read its updater and record the endpoint and format; until then the card stays open with its finding stated. If 3.0 is not out by the time the owner schedules it, close with that finding.

**Code:** `vsslicer/modules/profiles/prusa/docs/prusa-3-update-endpoint.md` (module: `profiles-prusa`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A note states the release inspected (version and commit), the endpoint and the index format, or that no production endpoint exists yet
- [ ] If an endpoint exists, follow-up changes to `r1` are listed as new cards, not made here

## Tasks

- [ ] Check the release
- [ ] Write the note

## Progress

Not started.
