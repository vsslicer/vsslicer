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
