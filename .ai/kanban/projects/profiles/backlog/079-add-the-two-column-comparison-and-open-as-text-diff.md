---
id: 79
title: "Add the two-column comparison and 'open as text diff'"
type: feature
priority: P1
effort: M
model: sonnet
area: [form]
story: US32
milestone: "VSS:M2"
sprint: "VSS:SP19"
depends_on: [144, 73, 74]
created: 2026-10-25
---

Compare two entities or an entity and its parent in the form, and hand the two files to VS Code's diff editor.

**Code:** `vsslicer/modules/apps/profiles/webview/compare/` and `vsslicer/modules/apps/profiles/src/presentation/form/diff.ts` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Comparing two Orca processes shows exactly the keys from the compare model (Playwright)
- [ ] 'Open as text diff' opens VS Code's diff editor for the two files (integration test)

## Tasks

- [ ] Write the two-column view
- [ ] Wire the diff command
- [ ] Tests

## Progress

Not started.
