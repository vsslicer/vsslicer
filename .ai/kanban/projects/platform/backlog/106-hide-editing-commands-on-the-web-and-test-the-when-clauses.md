---
id: 106
title: Hide editing commands on the web and test the when clauses
type: feature
priority: P2
effort: S
model: sonnet
area: [web]
story: US55
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [103, 85]
created: 2026-10-25
---

Lists editing, repair, STEP and arrange commands as `desktopOnlyCommands` with `!isWeb`, and shows a one-line note where a user would look for them.

**Code:** `vsslicer/modules/apps/project/src/presentation/...` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The tooling check passes on the manifest; a web test asserts none of those commands is in the palette
- [ ] The viewer toolbar shows the note on the web only

## Tasks

- [ ] Manifest
- [ ] Note
- [ ] Test

## Progress

Not started.
