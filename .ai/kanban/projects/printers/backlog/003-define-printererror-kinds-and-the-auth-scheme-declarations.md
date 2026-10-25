---
id: 3
title: Define PrinterError kinds and the auth scheme declarations
type: feature
priority: P0
effort: S
model: sonnet
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [2]
created: 2026-10-25
---

The typed error and auth vocabulary every adapter and consumer shares.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] `PrinterError` with kinds `auth, unreachable, timeout, refused, busy, unsupported, protocol, fileRejected`, a stable `kind` string and a cause; unit tests per kind
- [ ] Auth schemes `apikey, digest, session, bearer, token, pairing, accessCode` as data an adapter declares, with the fields a form needs (label, secret flag)
- [ ] Pure domain: no I/O, no `vscode` import (lint)

## Tasks

- [ ] Write the error classes
- [ ] Write the auth scheme descriptors
- [ ] Unit tests

## Progress

Not started.
