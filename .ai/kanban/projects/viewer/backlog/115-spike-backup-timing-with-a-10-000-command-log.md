---
id: 115
title: "Spike: backup timing with a 10,000-command log"
type: spike
priority: P1
effort: S
model: opus
area: [editor]
story: US37
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [102]
created: 2026-10-25
---

VS Code calls `backupCustomDocument` about a second after edits stop, so a long log could be slow. Measures serialise, compact and replay time of 1,000 to 10,000 commands and picks the compaction and cap rules.

**Code:** `vsslicer/modules/apps/project/docs/backup-log-spike.md` (module: `project-extension`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] Numbers for serialise, compact and replay at 1,000, 5,000 and 10,000 commands are recorded
- [ ] Compaction rules (merge consecutive transforms of one object) and the cap are written down
- [ ] The measurement script is checked in

## Tasks

- [ ] Script
- [ ] Measure
- [ ] Write the rules

## Progress

Not started.
