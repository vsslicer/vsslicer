---
id: 110
title: Run post-processing scripts in order on a temp copy and fail by name
type: feature
priority: P1
effort: M
model: opus
area: [postprocess]
story: US21
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [108, 109, 14]
created: 2026-10-25
---

Runs each script from the stripped `post_process` list or the workspace setting, in order, on a temp copy of the G-code, with a timeout, and detects a script that deletes its input.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] A non-zero exit, a timeout and a deleted input each fail the step naming the script; the unprocessed G-code stays in the temp directory
- [ ] Scripts run in list order and each sees the previous one's output
- [ ] The environment snapshot equals the recording (`pp_env`)
- [ ] Cancel kills a running script's tree

## Tasks

- [ ] Step runner
- [ ] Failure cases
- [ ] Cancel
- [ ] Tests with fixture scripts

## Progress

Not started.
