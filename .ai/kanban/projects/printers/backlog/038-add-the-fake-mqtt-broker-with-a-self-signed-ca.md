---
id: 38
title: Add the fake MQTT broker with a self-signed CA
type: chore
priority: P1
effort: M
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [31, PLT-13]
created: 2026-10-25
---

A test broker (Aedes, or mosquitto in CI) with a self-signed CA standing in for Bambu's, replaying fixture frames and recording commands.

**Code:** `vsslicer/modules/printer/bambu/test/support/` (module: `printer-bambu`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] The broker serves TLS with CN equal to a fixture serial, checks `bblp` plus access code, replays a fixture `push_status` stream and records published commands
- [ ] A wrong access code is refused; used by the connection, command and project-file cards

## Tasks

- [ ] Write the broker helper
- [ ] Self-signed CA generation
- [ ] Self test

## Progress

Not started.
