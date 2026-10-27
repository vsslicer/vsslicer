---
id: 42
title: Add the local implicit-TLS FTP server for tests
type: chore
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [31, PLT-13]
created: 2026-10-25
---

A local FTPS implicit-TLS (port 990 shape) server that checks `bblp` credentials and stores files in memory.

**Code:** `vsslicer/modules/printer/bambu/test/support/` (module: `printer-bambu`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] Server speaks implicit TLS with the test CA, accepts `bblp` and the access code, supports STOR, LIST, RETR, DELE and an abort mid-transfer
- [ ] Used by the FTPS upload and files cards

## Tasks

- [ ] Write the server
- [ ] Self test

## Progress

Not started.
