---
id: 118
title: Apply a follow position that arrives before the preview has loaded its moves
type: bug
priority: P1
effort: S
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 2 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Not started.

### sp11-gcp-118 (2026-10-26)

- **Fix (first option of the audit):** `gcode-preview/src/application/preview-session.ts` (application layer). The
  session keeps the last revealed move (`revealed`, set only after `resolvePosition` accepts the position); `deliver`
  posts a `seek` to it after the last move buffer. `start()` clears it, so a plate change or retry never seeks to a
  move of another parse. Webview untouched.
- **Tests** (`test/follow.test.ts`): (1) reveal while the load is gated, before the three move buffers arrive: the last
  event is `seek:50` after all three buffers; a reload of the same panel gets exactly `buffer x3, seek:50`.
  (2) Hostile/bounds: a layer past the last rejects with RangeError and leaves the last good move in place (part of 1);
  no new input or loop, the move is bounded by `resolvePosition` as before. (3) After `setPlate(2)` a new webview gets
  no seek. Waits are hang guards (poll up to 1 s), no wall-time asserts.
- **Mutation probes:** P1 drop the post-buffer seek: test 1 fails. P2 drop `revealed = undefined` in `start`: test 2
  fails. P3 never record the revealed move: test 1 fails. Source restored after each.
- **Verified** (macOS arm64; CI gate runs on ubuntu-latest): `pnpm install`, `pnpm lint` (eslint, prettier, tsc) pass,
  `pnpm build` passes, `pnpm test` 104/104 pass; `node scripts/run.mjs checks` exit 0.

Release lines:
- CHANGELOG (gcode-preview, Fixed): `Following a print that opens a new preview now lands on the printer's position: a seek that arrives before the move buffers is posted again after the last one (GCP-118, SP9 audit finding 2).`
- No new exports.

**Review passed (sp11-rev-gcp-118)** (2026-10-26)

- **Ran** in `vsslicer/modules/gcode-preview`: `pnpm install` ok, `pnpm lint` (eslint, prettier, tsc) pass,
  `pnpm build` pass, `pnpm test` 104/104 pass; `node scripts/run.mjs checks` exit 0.
- **Criteria:** the fix is the audit's first option (SP9-audit.md finding 2): `revealed` is set only after
  `resolvePosition` accepts the position, `deliver` re-posts the seek after the last move buffer, `start()` clears it.
  Test 1 asserts the race really happened (first `seek:50` before the last buffer) and that a seek follows the
  buffers; ordering and counts only, the 5 ms polls are hang guards, no wall-time assert. Bounds: no new input; a
  layer past the last rejects with RangeError and keeps the last good move.
- **Mutation probes** (temp copy, `node --test test/follow.test.ts`, baseline 12/12): drop the post-buffer seek: test 1
  fails; drop the reset in `start`: plate test fails; never record `revealed`: test 1 fails; record a bogus move
  before `resolvePosition` (bounds): test 1 fails; move the seek before the buffers: test 1 fails.
- **Layering:** change is in `application`, no VS Code import; the test's `@vsslicer/webview-kit/webview` import is a
  declared dependency (`^0.7.0`). No cross-module relative imports.
- **Coordinator:** the CHANGELOG line in "Release lines" is not yet in `CHANGELOG.md`.
