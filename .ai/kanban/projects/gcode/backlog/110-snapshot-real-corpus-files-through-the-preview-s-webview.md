---
id: 110
title: "Snapshot real corpus files through the preview's webview"
type: chore
priority: P2
effort: M
model: sonnet
sprint: "VSS:SP7"
depends_on: [34]
created: 2026-10-26
---

Follow-up from GCP-34 (SP6): the renderer snapshots in webview-kit use a synthetic part, because webview-kit cannot read gcode-preview's corpus. A gcode-preview spec should snapshot real corpus files through the preview's own load path.

**Code:** `vsslicer/modules/gcode-preview/test/` (module: `gcode-preview`, layer: presentation tests)

## Acceptance criteria

- [ ] Snapshots of two corpus files (one Bambu, one PrusaSlicer) in feature and speed modes, a layer range and travel hidden, through gcode-preview's webview bundle on SwiftShader
- [ ] Runs locally in under 2 minutes; CI waits on Q7

## Tasks

- [ ] Harness page loading the preview bundle with a parsed file
- [ ] Snapshot set

## Progress

Not started.
