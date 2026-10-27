---
id: 324
title: Build an AuthorizedFetch from the Moonraker session secrets
type: feature
priority: P1
effort: S
model: sonnet
area: [moonraker]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP35"
depends_on: [320, 199, 90]
created: 2026-10-25
---

`session.authorizedFetch()` returns a fetch that adds the API key header or an `access/oneshot_token` where a URL needs one (webcam and timelapse downloads), or sends nothing for trusted clients.

**Code:** `vsslicer/modules/printer/moonraker/src/adapters/...` (module: `printer-moonraker`, layer: `adapters`)

## Acceptance criteria

- [ ] On the replay harness: API key header added; oneshot token fetched once per use and not reused; trusted client sends no credential; a 401 gives `PrinterError.auth`
- [ ] Secrets never appear in thrown errors or logs (redaction test); relative URLs resolve against the printer
- [ ] Does not import `camera-api` (lint); the result is assignable to printer-api `AuthorizedFetch`

## Tasks

- [ ] Write the fetch
- [ ] Redaction test
- [ ] Replay tests

## Progress

Not started.
