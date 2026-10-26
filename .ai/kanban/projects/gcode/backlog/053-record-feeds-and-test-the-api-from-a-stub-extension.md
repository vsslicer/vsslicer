---
id: 53
title: Record feeds and test the API from a stub extension
type: chore
priority: P1
effort: M
model: sonnet
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP9"
depends_on: [51, 52]
created: 2026-10-25
---

Integration oracle that stands in for PRN.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] A recorded Moonraker `file_position` feed and a synthetic Bambu-style layer/percent feed are in fixtures
- [ ] A stub extension drives `exports` and, separately, the commands in `@vscode/test-electron`; both open the plate and follow the feed

## Tasks

- [ ] Recorded fixtures
- [ ] Stub extension
- [ ] Tests

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-52 (moved to SP6).
