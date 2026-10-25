---
id: 326
title: Build an AuthorizedFetch from the OctoPrint session secrets
type: feature
priority: P1
effort: S
model: sonnet
area: [octoprint]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP32"
depends_on: [320, 150]
created: 2026-10-25
---

`session.authorizedFetch()` adds the `X-Api-Key` (or the paired application key) to requests for webcam and timelapse URLs.

**Code:** `vsslicer/modules/printer-octoprint/src/adapters/...` (module: `printer-octoprint`, layer: `adapters`)

## Acceptance criteria

- [ ] On recorded responses: key header added; a 401 gives `PrinterError.auth`; secrets never appear in errors or logs
- [ ] Does not import `camera-api` (lint); assignable to printer-api `AuthorizedFetch`

## Tasks

- [ ] Write the fetch
- [ ] Tests

## Progress

Not started.
