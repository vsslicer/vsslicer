---
id: 17
title: "Spike: macOS quarantine and Gatekeeper for an Orca downloaded into global storage"
type: spike
priority: P0
effort: S
model: opus
area: [orca, engine]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [15]
created: 2026-10-25
---

Decides whether download is offered on macOS or only detection. No notarisation budget exists (D5), so a quarantine flag on a downloaded app may make it unlaunchable.

**Code:** `vsslicer/modules/slicer/orca/` (module: `slicer-orca`, layer: n/a (spike))

## Acceptance criteria

- [ ] On the owner's Mac: a downloaded Orca release run from `globalStorageUri` with and without the quarantine attribute; result and macOS version recorded
- [ ] Decision recorded: offer download on macOS (with the exact steps, e.g. clearing the attribute) or detection only
- [ ] The same finding is noted for the Cura spike (US15)

## Tasks

- [ ] Download with and without quarantine
- [ ] Try to launch
- [ ] Write the decision

## Progress

Not started.
