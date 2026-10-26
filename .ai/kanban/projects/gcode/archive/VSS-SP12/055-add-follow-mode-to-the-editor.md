---
id: 55
title: Add follow mode to the editor
type: feature
priority: P1
effort: L
model: sonnet
area: [live]
story: US18
milestone: "VSS:M1"
sprint: "VSS:SP12"
depends_on: [53, 38]
created: 2026-10-25
---

The view tracks the printed position.

## Acceptance criteria

- [x] The view tracks the position and dims the part above it
- [x] The user can break out and rejoin (test)

## Tasks

- [x] Follow state
- [x] Dimming range
- [x] Break-out and rejoin controls

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-53 (moved to SP6).

### SP11 worker sp11-gcp-55

Files (gcode-preview): new `src/domain/follow-state.ts` (pure `nextFollow`: feed / breakOut / rejoin); `src/presentation/webview/main.ts` (follow state, a Follow button in the toolbar, break-out on the three layer sliders, play/step buttons and the time slider; host `seek` is shown only while following, otherwise kept as the target and shown on rejoin); `src/presentation/webview/preview-renderer.ts` (`Visibility.dimAbove`: the moves after the visible range are drawn as a second pass); tests `test/follow-state.test.ts` (2), `test/renderer.test.ts` (+1).
- Dimming limit (commented shortcut): the kit shader has no alpha or darken uniform and webview-kit is not this card's module, so the part above the playhead is drawn flat in the range palette's first colour (the highlight's Width + out-of-range trick), not faded. A true fade needs a uniform in webview-kit; suggest a follow-up card.
- The view-tracking itself already existed (GCP-52/53: host `seek` moves the playhead and the visible range); this card adds the dim, break-out and rejoin.
- Mutation probes (restored, files compared): `dimAbove` forced off -> renderer test fails; feed shown while broken out -> follow-state test fails; rejoin without the kept target -> follow-state test fails.
- Verification (macOS local; CI gate platform not checked): `pnpm lint` clean, `pnpm build` ok, `pnpm test` 116/116, `node scripts/run.mjs checks` clean. Integration (`@vsslicer/test-vscode`) and the DOM wiring in main.ts (button, break-out handlers) not run; the break-out/rejoin rule is tested through the pure state only.
- Bounds: no new parsing or input handling.

Release lines:
- CHANGELOG: `- Follow mode: the part after the followed position is dimmed; the user can break out (sliders, play, step, time) and rejoin at the newest fed position (GCP-55).`
- No export lines.

**Carried to SP12 (sp11-coordinator, 14:26):** built and in review, but no reviewer could be dispatched (the permission classifier refused the review dispatches, Q29). The unreviewed work is parked, untracked, under `.ai/local/wip/SP11/` at the same paths; copy it back before the review. Its release lines above still apply. Nothing of it is committed.

**Review failed (sp11-rev-gcp-55)**

Ran in `vsslicer/modules/gcode-preview` (registry up): `pnpm install` ok, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 116/116 pass; `node scripts/run.mjs checks` clean. Layering ok: `follow-state.ts` is pure domain, the webview imports it inside the module, no VS Code import outside presentation. The host `seek` only comes from `PreviewSession.reveal` (follow) and its re-post after the buffers (`preview-session.ts:118,199`), so treating every host seek as a feed is right.

Mutation probes (temporary edits, restored and compared with `cmp`):
- feed shown while broken out -> follow-state test fails; feed not kept as target -> fails; rejoin leaving `following` false -> fails.
- dim pass starting at `end + 1` -> renderer test fails; dim pass drawn in the normal colour mode -> fails.
- dim pass removed from the highlight branch (`preview-renderer.ts:159`) -> nothing fails (untested path, see 2).

Problems:
1. `src/presentation/webview/main.ts:172,192,248,250`: follow mode is on in every preview, followed or not. A G-code file nobody follows opens with a "Following (click to break out)" button, Play/step/sliders flip it to "Rejoin follow", and `dimAbove` is on for it. The follow state also lives outside `api.setState`, so after a webview reload the restored view (a layer the user had scrubbed to) comes back with `following: true`, dimmed above and labelled as following, although the user had broken out. Probe: read of `let follow: FollowState = { following: true }` and the unconditional `toolbar.append(followButton, ...)`; no feed is needed for the label or the dim. Expected rule: a preview is in follow mode only once the host has fed it a position (first `seek`); until then no follow button and no dim. Keep the follow state with the rest of the view in `setState` so a reload keeps it.
2. `test/renderer.test.ts` (the new `dimAbove` test) covers only the no-highlight branch; the `dim()` after the highlight passes (`preview-renderer.ts:159`) can be deleted with every test passing. Expected: one assertion that a draw with a highlight and `dimAbove` still draws every move once.

Not checked: the DOM wiring in `main.ts` and the extension-host integration tests were not run, as the worker also noted.

**Carried to SP12 (sp11-coordinator, 14:47):** the fix is not started; the reviewed work is parked again under `.ai/local/wip/SP11/` (copy it back first).

### SP12 rework sp12-gcp-55

Fixed review problems (gcode-preview): `src/presentation/webview/main.ts`: a preview counts as followed only once the host fed it a position (`follow.target` set): until then the Follow button is hidden and `dimAbove` is off; the follow state is saved in the view via `setState` (`SavedView.follow`), so a reload restores a broken-out view as broken out. `test/renderer.test.ts`: new test "dimAbove with a highlight still draws every move once".
- Probes: removing the `dim()` after the highlight passes -> the new renderer test fails (restored, cmp equal). Criteria probes from SP11 still apply (feed shown while broken out, rejoin without target -> follow-state tests fail). The main.ts hide/persist wiring is DOM and untested (same as before).
- Verification (macOS local; CI gate platform not checked): lint clean, build ok, `pnpm test` 117/117, `node scripts/run.mjs checks` clean. Integration tests not run.
- Release lines: unchanged from SP11.

**Review passed (sp12-rev-gcp-55)**

Ran in `vsslicer/modules/gcode-preview` (registry up): `pnpm install` ok, `pnpm lint` clean, `pnpm build` ok, `pnpm test` 118/118 pass (one more than the rework's 117: the uncommitted `api-check` test in the same tree, not this card); `node scripts/run.mjs checks` clean. Layering ok: `follow-state.ts` is pure domain, imported by the webview inside the module; no VS Code import outside presentation; no keydown or other path changes the layer or move besides the guarded sliders and play/step/time buttons.

SP11 problems against the rework:
1. Fixed. `main.ts:174-175,182,257,260`: a preview is followed only once `follow.target` is set by a host `seek` (`main.ts:501-505`); before that the button is hidden and `dimAbove` is false. `follow` is restored from `api.getState()?.follow` and written back by `setFollow` with the rest of the view, so a broken-out view reloads broken out, and the host's re-posted seek after the buffers (`preview-session.ts:118`) is then only kept as the target, not shown. Checked by reading; the DOM wiring has no test (accepted in SP11, criterion 2 is tested through the pure state).
2. Fixed. New test "dimAbove with a highlight still draws every move once".

Mutation probes (temporary edits, each restored and compared with `cmp`; tree checked after):
- Criterion 1 (dim): `dim()` removed after the highlight passes -> 1 renderer test fails; dim from `end + 1` -> 2 fail; count `moveCount - end - 1` -> 2 fail; dim drawn in the normal colour mode -> 2 fail; `vis.dimAbove` guard removed -> 3 fail.
- Criterion 2 (break out, rejoin): feed always shown -> follow-state test fails; feed not kept as target -> fails; breakOut leaves `following` true -> fails; rejoin without seeking the target -> fails.
- Expected counts come from the parser fixture (`parsed.moveCount - 1`, the idiom of the existing test at `renderer.test.ts:83`), not from the renderer under test.

Notes for later (not failures): the dimmed part and a hovered object's highlight share the gradient's first colour (the commented shortcut, `preview-renderer.ts:108`), so a webview-kit fade uniform remains the follow-up. `onPlate` (`main.ts:362`) resets the saved view to `{ layer: null }`, dropping `follow` from it until the next feed rewrites it; in memory the state is kept.

Not checked: extension-host integration tests and a live webview were not run.
