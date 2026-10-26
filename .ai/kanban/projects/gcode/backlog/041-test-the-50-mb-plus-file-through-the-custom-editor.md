---
id: 41
title: Test the 50 MB-plus file through the custom editor
type: chore
priority: P0
effort: M
model: sonnet
area: [editor]
story: US14
milestone: "VSS:M1"
sprint: "VSS:SP8"
depends_on: [18, 30]
created: 2026-10-25
---

Proves the host stays responsive.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] `@vscode/test-electron` opens a file over 50 MB; not a `TextDocument`; host thread never blocked over 100 ms (measured)

## Tasks

- [ ] Generate file
- [ ] Event-loop lag probe
- [ ] Test

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-18, whose CI step waits on Q7.
