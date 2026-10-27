---
id: 417
title: Talk to the CC2 over HTTP with a token and chunked upload
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US70
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [416]
created: 2026-10-25
---

HTTP client for info, status and the chunked `POST /upload` with progress and abort; the token travels in the `X-Token` header, not the query, wherever the printer allows.

**Code:** `vsslicer/modules/printer/unofficial-elegoo-cc2/src/adapters/...` (module: `printer-unofficial-elegoo-cc2`, layer: `adapters`)

## Acceptance criteria

- [ ] The replay harness runs info, status and a chunked upload; a wrong token maps to `auth`
- [ ] The token never appears in logs (test over captured output)

## Tasks

- [ ] Client
- [ ] Chunked upload
- [ ] Auth
- [ ] Tests

## Progress

Not started.
