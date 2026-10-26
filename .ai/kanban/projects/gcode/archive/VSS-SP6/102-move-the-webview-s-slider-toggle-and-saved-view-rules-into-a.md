---
id: 102
title: "Move the webview's slider, toggle and saved-view rules into a pure tested function"
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-preview (presentation, webview). Finding 5 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] The rules in main.ts live in a pure function in controls.ts with plain-Node tests, including the load-keeps-the-saved-view case
- [x] A test that fails before the fix

## Tasks

- [x] Fix as the audit describes

## Progress

Done. `nextView(view, event)` in `controls.ts` is the one pure function: events `top`, `bottom`, `move` (value and slider max), `role`, `travel`, `play` and `load`. The handlers in `main.ts` (sliders, role and travel toggles, `apply` for play, the load step) now call it through `patch(event)`; the inline rules are gone.
Verified: new `test/controls.test.ts` (7 cases, plain Node): top clamps the bottom and resets move; bottom pushes the top up and keeps move only if the top is unchanged; the slider max gives `move` undefined; role XOR is unsigned (bit 31 stays positive) and toggles back; travel flips the flag; play overwrites layer, move and bottom; load keeps a saved view and defaults a fresh one to the top layer. The function did not exist before, so the tests could not pass on the old code; the inline rules were not covered. `pnpm lint && build && test` pass (60 tests).
Not done: no DOM test of the handlers themselves (the wiring is one line each).
Files: `vsslicer/modules/gcode-preview/src/presentation/webview/controls.ts` (adds `ViewRules`, `ViewEvent`, `nextView` at the end, from L21), `vsslicer/modules/gcode-preview/src/presentation/webview/main.ts` (import, `patch` ~L137, handlers ~L141-L145, toggles ~L250-L255, `apply`, load ~L287), `vsslicer/modules/gcode-preview/test/controls.test.ts` (new).
Changelog: Internal: the webview's slider, toggle and saved-view rules are a tested pure function.
Review passed (gcp101-102-reviewer): lint/build/test green. main.ts diff checked line by line: handlers, role/travel toggles, load and play are equivalent; bottom for play is still computed from the state at patch time (min(state.bottom ?? 0, layer)), now inside nextView. Mutation probes in scratch (top/play min->max, bottom max->min, dropped >>> 0) each make controls.test.ts fail.
