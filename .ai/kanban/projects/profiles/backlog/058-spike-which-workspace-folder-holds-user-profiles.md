---
id: 58
title: "Spike: which workspace folder holds user profiles"
type: spike
priority: P1
effort: S
model: opus
area: [store]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [57]
created: 2026-10-25
---

Checks how VS Code orders `workspaceFolders` and settles the rule (first folder with `.vsslicer/`, else the first folder).

**Code:** `vsslicer/modules/profiles-extension/docs/multi-root.md` (module: `profiles-extension`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] A test-electron run with a 3-folder workspace records the folder order and the chosen rule
- [ ] The README limitation for remote and web hosts (installed-slicer detection is local only) is drafted

## Tasks

- [ ] Run the experiment
- [ ] Write the rule and limitation text

## Progress

Not started.
