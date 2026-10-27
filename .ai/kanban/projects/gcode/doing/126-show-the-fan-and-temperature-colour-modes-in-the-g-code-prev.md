---
id: 126
title: Show the fan and temperature colour modes in the G-code preview
type: feature
priority: P1
effort: M
model: sonnet
sprint: "VSS:SP13"
depends_on: [107]
created: 2026-10-26
---

Follow-up of GCP-107, which built the modes in `webview-kit` (released as 0.8.0 at SP12's close). The preview still has to send the parser's state changes to the webview and offer the modes.

**Code:** `vsslicer/modules/apps/gcode-preview/src/presentation/` (`preview-session.ts`, `webview/main.ts`) (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] gcode-preview depends on `@vsslicer/webview-kit@^0.8.0` and passes the state changes to `createSegmentRenderer({ stateChanges })`
- [ ] Fan (%) and Temperature (°C) are in the colour-mode picker with their legend ranges
- [ ] Switching to either uploads no geometry (spyGlUploads), and the state changes are sent once per file
- [ ] **Bounds:** the state-change buffer sent to the webview is capped, with a cap and cap-plus-one test

## Progress

Not started. The proposal is in GCP-107's Progress.
