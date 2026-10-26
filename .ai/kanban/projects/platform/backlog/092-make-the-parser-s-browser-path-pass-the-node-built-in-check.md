---
id: 92
title: "Make the parser's browser path pass the Node-built-in check"
type: refactor
priority: P2
effort: S
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [GCP-16, 81, 91]
created: 2026-10-25
---

Runs the check on the parser's browser entry and replaces what it finds behind existing ports (for example the MD5 of `.gcode.3mf` plates and zip inflate), without changing desktop results.

**Code:** `vsslicer/modules/gcode-parser/src/domain/...` (module: `gcode-parser`, layer: `domain`)

## Acceptance criteria

- [ ] The check passes on the browser entry; golden outputs are unchanged on desktop
- [ ] An MD5 mismatch on a doctored `.gcode.3mf` is still diagnosed in the browser build

## Tasks

- [ ] Run the check
- [ ] Replace imports
- [ ] Golden and MD5 tests

## Progress

Not started.
