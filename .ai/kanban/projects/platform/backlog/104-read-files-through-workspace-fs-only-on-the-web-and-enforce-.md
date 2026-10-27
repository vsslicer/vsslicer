---
id: 104
title: Read files through workspace.fs only on the web and enforce the size limit
type: feature
priority: P2
effort: S
model: sonnet
area: [web]
story: US54
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [103, 86]
created: 2026-10-25
---

On the web, models are read with `vscode.workspace.fs` and a file above the web size limit shows the stated message and opens nothing.

**Code:** `vsslicer/modules/apps/project/src/presentation/...` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A file above the limit shows the message and opens nothing; below it opens
- [ ] The limit is a documented setting; desktop is unchanged

## Tasks

- [ ] Read path
- [ ] Limit and message
- [ ] Tests

## Progress

Not started.
