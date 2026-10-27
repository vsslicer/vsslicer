---
id: 353
title: Build the Marlin emulator core with fault injection
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [346, 347, 349]
created: 2026-10-25
---

A test double of a Marlin printer behind the `SerialLink` port: validates `N`/checksum, answers `ok`, `Resend:`, busy periods and the `M105`, `M115`, `M27` replies from the fixtures, with injectable bit flips, dropped characters, delayed `ok`s and a configurable firmware reply.

**Code:** `vsslicer/modules/printer/serial/src/adapters/testing/` (module: `printer-serial`, layer: `adapters`)

## Acceptance criteria

- [ ] The emulator accepts framed lines, answers per the fixtures and rejects a bad checksum with the Marlin error text
- [ ] Each fault is injectable by seed so a failing run is reproducible
- [ ] Exported from `@vsslicer/printer-serial/testing` and documented

## Tasks

- [ ] State machine
- [ ] Fault injection
- [ ] Export and docs

## Progress

Not started.
