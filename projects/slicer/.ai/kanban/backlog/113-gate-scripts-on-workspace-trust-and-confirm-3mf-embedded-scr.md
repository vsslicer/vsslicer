---
id: 113
title: Gate scripts on Workspace Trust and confirm 3MF-embedded scripts
type: feature
priority: P1
effort: S
model: opus
area: [postprocess]
story: US21
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [110, 100]
created: 2026-10-25
---

Security: scripts run only in a trusted workspace, and a `post_process` found in a 3MF's embedded config is shown and needs explicit confirmation.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] In an untrusted workspace no script runs and the task output says why (integration test)
- [ ] An embedded `post_process` from a 3MF is never used without a confirmation that shows the command lines (test)
- [ ] A setting disables post-processing per workspace

## Tasks

- [ ] Trust check
- [ ] Confirmation prompt
- [ ] Setting

## Progress

Not started.
