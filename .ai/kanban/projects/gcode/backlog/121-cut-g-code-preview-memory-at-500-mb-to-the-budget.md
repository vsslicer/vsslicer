---
id: 121
title: Cut G-code preview memory at 500 MB to the budget
type: feature
priority: P1
effort: L
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [42]
created: 2026-10-26
---

From GCP-42 (SP10): at 500 MB the preview peaks at host 656 MB, worker 561 MB, webview 978 MB on SwiftShader (arc-heavy: 2,984 MB host plus webview), against the target of about 1 GB total (`.reference/notes/GCP-42-memory.md`, `vsslicer/modules/gcode-preview/bench/`). Blocked on the owner's answer to the GCP-42 budget question.

**Code:** `vsslicer/modules/gcode-preview` (adapters: worker and webview buffers)

## Acceptance criteria

- [ ] Profile where the peak goes at 500 MB (host buffers, worker parse arrays, webview geometry copies) and cut it to the budget the owner sets; `pnpm bench` passes with the lowered `bench/budget.json`
- [ ] Arc-heavy files measured too

## Progress

Not started.
