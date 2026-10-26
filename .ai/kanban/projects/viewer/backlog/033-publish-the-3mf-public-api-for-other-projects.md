---
id: 33
title: Publish the 3MF public API for other projects
type: feature
priority: P1
effort: S
model: sonnet
area: [3mf]
story: US26
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [9, 21, 23, 25, 27]
created: 2026-10-25
---

One entry point with accessors the later epics need: embedded presets (E12), plate G-code with its MD5 and plate metadata (E21, E3), part replacement (E27).

**Code:** `vsslicer/modules/3mf/src/application/api.ts` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] Accessors `embeddedPresets(project)`, `plateGcode(project, n)` returning bytes and the recorded MD5, and the part API are exported
- [ ] Public types are listed in an API report and CI fails on an unreviewed change
- [ ] Examples in the README compile in a test

## Tasks

- [ ] Write the accessors
- [ ] API report in CI
- [ ] README example test

## Progress

Not started.
