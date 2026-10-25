---
id: 328
title: Build an AuthorizedFetch from the PrusaLink session secrets
type: feature
priority: P1
effort: S
model: sonnet
area: [prusalink]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [320, 151]
created: 2026-10-25
---

`session.authorizedFetch()` answers PrusaLink's Digest challenge (or sends `X-Api-Key`) for camera URLs.

**Code:** `vsslicer/modules/printer-prusalink/src/adapters/...` (module: `printer-prusalink`, layer: `adapters`)

## Acceptance criteria

- [ ] Digest challenge-response against the recorded 401 on a camera URL; key fallback when offered; wrong credentials give `PrinterError.auth`
- [ ] Secrets never appear in errors or logs; does not import `camera-api` (lint); assignable to printer-api `AuthorizedFetch`

## Tasks

- [ ] Write the fetch
- [ ] Tests

## Progress

Not started.
