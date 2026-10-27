---
id: 82
title: Add the Spoolman-in-Docker contract test harness to CI
type: chore
priority: P2
effort: M
model: sonnet
area: [spoolman]
story: US34
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [80, PLT-9]
created: 2026-10-25
---

A CI job on Linux runners (free, D5) that starts Spoolman at the pinned tag and exposes its URL to the contract tests; skipped on other platforms with a visible reason.

**Code:** `vsslicer/modules/filament/spoolman/` CI entry (module: `filament-spoolman`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] The job starts Spoolman at the pinned tag, waits for health and tears it down; the tag is recorded in the job log
- [ ] On macOS and Windows the contract tests are reported as skipped, not passed

## Tasks

- [ ] Write the workflow
- [ ] Write the health wait
- [ ] Skip logic

## Progress

Not started.
