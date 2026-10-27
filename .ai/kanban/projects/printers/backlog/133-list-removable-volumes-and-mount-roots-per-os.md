---
id: 133
title: List removable volumes and mount roots per OS
type: feature
priority: P1
effort: M
model: sonnet
area: [storage]
story: US27
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [130]
created: 2026-10-25
---

Mount root listing: macOS `/Volumes`, Linux `/media` and `/run/media`, Windows drive letters; any folder is also allowed.

**Code:** `vsslicer/modules/printer/folder/src/adapters/...` (module: `printer-folder`, layer: `adapters`)

## Acceptance criteria

- [ ] Per-OS lister unit tests against fake directory layouts; system volumes are labelled and not preselected
- [ ] Manual checklist on macOS, Windows and Linux for the real lister

## Tasks

- [ ] Listers
- [ ] Fake layout tests
- [ ] Checklist

## Progress

Not started.
