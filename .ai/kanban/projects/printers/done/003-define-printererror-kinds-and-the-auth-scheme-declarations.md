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
sprint: "VSS:SP8"
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

Review (sp8-reviewer-19, 2026-10-26 08:17): PASS
- AC1: `PRINTER_ERROR_KINDS` has exactly the eight kinds; `PrinterError` carries a stable `kind` and an optional ES2022 `cause` (vsslicer/modules/printer-api/src/domain/errors.ts:4-27); test.each covers every kind (test/errors-auth.test.ts:25).
- AC2: seven schemes as data with `name`, `label`, `secret` (src/domain/auth.ts:23-37). Checked against docs/research/printer-connectivity.md:31,44,56,64-65,76,211 (Moonraker api key/JWT, OctoPrint key + AppKeys pairing, PrusaLink digest/X-Api-Key, Duet session password, Repetier) and docs/research/bambu-connectivity.md:17,46 (Bambu LAN access code with fixed user `bblp`, cloud bearer). Matches.
- AC3: domain imports nothing; lint (eslint + boundary rule), test, build and `node scripts/run.mjs checks` pass. No wall-time asserts.
- Non-blocking: (a) `AUTH_SCHEMES` is readonly only at type level; `Object.freeze` it if consumers ever get it from plain JS (auth.ts:23). (b) `isPrinterError` uses `instanceof`, which fails across two installed copies of printer-api; consider also accepting `name === 'PrinterError'` with a known `kind` (errors.ts:29-31). (c) Moonraker's trusted-client / oneshot flow (research :31,222) is not a scheme here; the card's list does not ask for it, so it is a follow-up for the Moonraker adapter.
