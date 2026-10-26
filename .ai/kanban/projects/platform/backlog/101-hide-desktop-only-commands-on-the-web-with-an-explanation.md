---
id: 101
title: Hide desktop-only commands on the web with an explanation
type: feature
priority: P2
effort: S
model: sonnet
area: [web]
story: US55
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [98, 85]
created: 2026-10-25
---

Marks follow, printer and daemon-dependent commands `desktopOnlyCommands`, gives them `!isWeb` in their `when` clauses, and shows a one-line note where the follow control would be.

**Code:** `vsslicer/modules/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] The tooling check passes on the manifest; a web test asserts the commands are absent from the palette
- [ ] The note appears in the preview toolbar on the web and not on desktop

## Tasks

- [ ] Manifest
- [ ] Note
- [ ] Test

## Progress

Not started.
