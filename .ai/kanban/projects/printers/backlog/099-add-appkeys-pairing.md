---
id: 99
title: Add AppKeys pairing
type: feature
priority: P0
effort: S
model: sonnet
area: [octoprint]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [98]
created: 2026-10-25
---

Request an application key through the AppKeys workflow instead of copying a key.

**Code:** `vsslicer/modules/printer-octoprint/src/adapters/...` (module: `printer-octoprint`, layer: `adapters`)

## Acceptance criteria

- [ ] Pairing flow tested against the recorded session and, when the CI job exists, the virtual printer; a denied or timed-out request gives a typed error
- [ ] The key is returned to the host for SecretStorage, never logged

## Tasks

- [ ] Pairing flow
- [ ] Tests

## Progress

Not started.
