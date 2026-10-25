---
id: 20
title: Projects and boards
type: chore
priority: P0
effort: M
model: opus
area: [platform]
milestone: R2
sprint: SP1
created: 2026-10-25
---

Decide the project split and create one board per project under projects/<name>/.ai/kanban, linked from the VSS board.

## Acceptance criteria

- [x] decisions/D7 justifies the split and the keys
- [x] Every project board exists from the template with own name, key, area options, notes path, projects link back to VSS, column folders and order files
- [x] VSS board.json projects map links every project
- [x] board.py check prints Board OK on every board

## Tasks

- [x] Write D7
- [x] Generate boards
- [x] Link and check

## Progress

Done. decisions/D7 (proposed). Seven boards under projects/<name>/.ai/kanban from the skill template, each with its own key and areas, notes under .reference/notes, model field, and a full mesh of projects links; VSS links all seven. check prints Board OK on all eight boards; readmes written.
