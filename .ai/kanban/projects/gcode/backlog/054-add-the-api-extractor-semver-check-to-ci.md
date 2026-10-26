---
id: 54
title: Add the api-extractor semver check to CI
type: chore
priority: P1
effort: S
model: sonnet
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP7"
depends_on: [50]
created: 2026-10-25
---

A breaking API change must fail without a major bump. Needs PLT CI.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] api-extractor report is checked in; a breaking change fails CI without a major version bump (demonstrated by a test change)

## Tasks

- [ ] Configure api-extractor
- [ ] CI step

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: depends on GCP-50 (moved to SP6), and its CI criterion waits on Q7.
