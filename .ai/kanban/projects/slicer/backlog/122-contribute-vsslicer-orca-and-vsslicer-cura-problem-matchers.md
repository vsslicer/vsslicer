---
id: 122
title: Contribute `$vsslicer-orca` and `$vsslicer-cura` problem matchers
type: feature
priority: P1
effort: M
model: sonnet
area: [tasks]
story: US19
milestone: "VSS:M3"
sprint: "VSS:SP24"
depends_on: [121, 117]
created: 2026-10-25
---

Matchers in `package.json` for the warning lines, tested on the recordings.

**Code:** `vsslicer/modules/apps/slicer/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] One Problems entry per recorded warning, with severity and message (regression: a changed format drops warnings)
- [ ] A line that is not a warning creates no entry
- [ ] The matcher names are documented for task authors

## Tasks

- [ ] Patterns
- [ ] Tests on recordings
- [ ] Docs

## Progress

Not started.
