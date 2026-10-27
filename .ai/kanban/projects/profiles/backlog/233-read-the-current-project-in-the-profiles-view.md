---
id: 233
title: Read the current project in the Profiles view
type: feature
priority: P0
effort: S
model: sonnet
area: [store]
story: US25
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [61, VWR-419]
created: 2026-10-27
---

E70's criterion "the Printers and Profiles views read the current project", in its smallest form: the Profiles view knows which project the window is on, through `vsslicer.project`'s exported API (D23). Highlighting the project's selected profiles waits for D22's profile model and the project's printer selection; no profile-entity change here.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/tree/` and `package.json` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `extensionDependencies` names `vsslicer.project`; the types come from `@vsslicer/project-extension/api` (semver range on 0.1.x, dev dependency); no import of its code
- [ ] The Profiles view's `description` shows the current project's name and updates on `onDidChange`; with no project it is empty
- [ ] If `vsslicer.project` is missing or its exports have no `currentProject`, the view works and logs one line to the output channel
- [ ] Integration test (`pnpm test:integration`, both extensions loaded): changing the current project updates the Profiles view description

## Tasks

- [ ] Read the API and subscribe
- [ ] Integration test

## Progress

Not started.
