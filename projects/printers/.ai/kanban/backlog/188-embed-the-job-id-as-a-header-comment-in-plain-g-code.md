---
id: 188
title: Embed the job id as a header comment in plain G-code
type: feature
priority: P1
effort: S
model: sonnet
area: [history]
story: US51
milestone: "VSS:M4"
depends_on: [182]
created: 2026-10-25
---

A pure transform that adds `; vsslicer_job_id = <id>` in the leading comment block and reads it back.

**Code:** `vsslicer/modules/job-history/src/domain/...` (module: `job-history`, layer: `domain`)

## Acceptance criteria

- [ ] Idempotent; the id is found by the reader on the result; the thumbnail block and the first move are untouched
- [ ] Fixtures from Moonraker metadata parsing show the comment is ignored

## Tasks

- [ ] Transform and reader
- [ ] Fixture tests

## Progress

Not started.
