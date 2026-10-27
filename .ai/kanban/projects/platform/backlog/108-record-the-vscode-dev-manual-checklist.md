---
id: 108
title: Record the vscode.dev manual checklist
type: docs
priority: P2
effort: S
model: sonnet
area: [web]
story: US56
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [102, 107]
created: 2026-10-25
---

A checklist with browser and date columns for the one manual run per release on vscode.dev: open a G-code file from a public GitHub repository, scrub layers, read thumbnails, open a 3MF, and on Chrome open a local folder with File System Access.

**Code:** `vsslicer/modules/tooling/tooling/docs/web-checklist.md` (module: `tooling`, layer: `n/a (docs)`)

## Acceptance criteria

- [ ] The checklist lists each step with the expected result and has a results table with browser, version and date
- [ ] It states that CI covers Chromium on fixtures only and no printer is involved

## Tasks

- [ ] Write the checklist
- [ ] Link it from the release docs

## Progress

Not started.
