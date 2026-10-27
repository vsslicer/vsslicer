---
id: 452
title: Read the current project in the Printers view
type: feature
priority: P0
effort: S
model: sonnet
area: [api]
story: US75
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [20, VWR-419]
created: 2026-10-27
---

E70's criterion "the Printers and Profiles views read the current project", in its smallest form: the Printers view knows which project the window is on, through `vsslicer.project`'s exported API (D23), never through files. Marking the project's own printer waits for the project's printer selection (VWR plate printer cards).

**Code:** `vsslicer/modules/apps/printers/src/presentation/` and `package.json` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `extensionDependencies` names `vsslicer.project`; the types come from `@vsslicer/project-extension/api` (semver range on 0.1.x, dev dependency); no import of its code
- [ ] The Printers view's `description` shows the current project's name and updates on `onDidChange`; with no project it is empty
- [ ] If `vsslicer.project` is missing or its exports have no `currentProject`, the view works and logs one line to the output channel
- [ ] Integration test (`pnpm test:integration`, both extensions loaded): changing the current project through the project extension's test hook updates the Printers view description

## Tasks

- [ ] Read the API and subscribe
- [ ] Integration test

## Progress

Not started.
