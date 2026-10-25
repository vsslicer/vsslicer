---
id: 43
title: Write the gcode language contribution and TextMate grammar
type: feature
priority: P0
effort: M
model: sonnet
area: [language]
story: US15
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [4]
created: 2026-10-25
---

Highlighting for `*.gcode`, `*.g`, `*.gco`, `*.nc` including Klipper extended commands and the `[var]`, `{expr}` placeholders (highlighting only; the catalogue is E50). Needs the PLT extension packaging.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Grammar snapshot tests (vscode-tmgrammar-test) over corpus excerpts from each slicer and hand-written Klipper and RRF macros; a retokenisation fails
- [ ] Large-file mode turns tokenisation off past 20 MB; grammar tokenises a 20 MB file within a recorded time

## Tasks

- [ ] Language configuration
- [ ] Grammar
- [ ] Snapshot tests
- [ ] Performance measurement

## Progress

Not started.
