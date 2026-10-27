---
id: 319
title: Add the AuthorizedFetch type and an optional session member to printer-api
type: feature
priority: P1
effort: S
model: sonnet
area: [api]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [194]
created: 2026-10-25
---

Camera and timelapse modules need HTTP requests authenticated from a session's secrets. Choice: the function shape lives in `printer-api` (connectors already depend on it and must not depend on `camera-api`); `camera-api`'s `AuthorizedFetch` (PRN-242) is declared structurally identical so the agent can hand one value to both, and a later camera-api release may re-export this one.

**Code:** `vsslicer/modules/common/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] `type AuthorizedFetch = (input: string | URL, init?: RequestInit) => Promise<Response>` exported from `printer-api` and an optional `Session.authorizedFetch?(): AuthorizedFetch` member; relative URLs resolve against the printer's base URL
- [ ] A compile test assigns a `printer-api` `AuthorizedFetch` to the `camera-api` one and back
- [ ] Contract kit: when a session provides it, a request to an unauthorised fixture route fails with `PrinterError.auth` and the secrets never appear in error text

## Tasks

- [ ] Write the type and member
- [ ] Compile test
- [ ] Kit check

## Progress

Not started.
