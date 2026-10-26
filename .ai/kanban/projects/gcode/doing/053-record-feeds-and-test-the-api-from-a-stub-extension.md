---
id: 53
title: Record feeds and test the API from a stub extension
type: chore
priority: P1
effort: M
model: sonnet
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP11"
depends_on: [51, 52]
created: 2026-10-25
---

Integration oracle that stands in for PRN.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] A Moonraker `file_position` feed in the recorded shape (synthetic until a capture exists; settled by the coordinator, real capture carried in its own card) and a synthetic Bambu-style layer/percent feed are in fixtures
- [x] A stub extension drives `exports` and, separately, the commands in `@vscode/test-electron`; both open the plate and follow the feed

## Tasks

- [x] Recorded fixtures
- [x] Stub extension
- [x] Tests

## Progress

Not started.
- Moved SP5 to SP6 at SP5 start: dependency-blocked in SP5 (rule 7): depends on GCP-52 (moved to SP6).

### SP11 worker sp11-gcp-53

Files (all in `vsslicer/modules/gcode-preview/test/`): `fixtures/feeds/moonraker-file-position.json`, `fixtures/feeds/bambu-layer-percent.json`, `fixtures/feeds/PROVENANCE.md`, `integration/stub-extension.ts`, `integration/follow-feeds.test.ts`.

- Fixtures are synthetic, NOT captured from hardware (no printer available): Moonraker `notify_status_update` messages with `virtual_sdcard.file_position` at line starts of the PrusaSlicer fixture; Bambu `push_status` `layer_num`/`mc_percent` over the 100-layer cube. Stated in feeds/PROVENANCE.md. "Recorded" is met by checked-in sequences in the real shapes; swap for captures later.
- Stub: `stubExtension(route)` follows through the extension's `exports` or, separately, through `vsslicer.gcode.follow`/`stopFollow` with a URI string (cross-host form). Limitation (shortcut commented in the file): @vsslicer/test-vscode loads one extension under development, so the stub runs as code in the test's extension host using only the public surface, not as a second installed extension. Coordinator: a real second extension needs the harness to accept several folders (test-vscode module).
- Tests: 4 integration tests (2 routes x 2 feeds): each push opens/updates the preview; the marker (`probe.progress().move`) must equal the move `session.reveal` resolves for that position, only advance, and end past where it started.
- Mutation probes: commands route pointed at a wrong command -> both commands tests fail (preview never opens); Moonraker fileOffset forced to 0 -> both moonraker tests fail ("marker moved from the first position to the last"). Restored.
- Verification: integration on VS Code stable and 1.100.0: the 4 new tests pass in every run. Prettier and eslint on changed files clean. `pnpm test:integration` fails to build right now on another card's file (`test/api-check.test.ts` TS7016, GCP-54 in flight), so I ran esbuild + `vsslicer-test-vscode` directly. `checks` ran, tail output only clean (check-licence, check-fixtures). Did not run full `pnpm test`/`lint` (blocked by the same tsc error).
- Pre-existing flake: "plays, pauses, steps..." (timeline) intermittently times out on both versions; it also fails with my test file removed (2/2 runs), so not caused by this card. CI gate platform: not checked (local macOS run).

Release lines:
- CHANGELOG: `- Test: recorded-shape Moonraker file_position and Bambu layer/percent feeds, and a stub extension that follows them through exports and through the commands in @vscode/test-electron (GCP-53).`
- No export lines.

**Review failed (sp11-rev-gcp-53)**

Ran in `vsslicer/modules/gcode-preview`: `pnpm install` (up to date), `pnpm lint` (eslint, prettier, tsc clean), `pnpm test` 111/111, `pnpm test:integration`: the 4 new tests pass on 1.100.0 and stable 1.143.1 (15/15 on 1.100.0; 14/15 on stable, the failure is "plays, pauses, steps..." on the timeline). That flake is not this card's: with `follow-feeds.test.ts` left out of the bundle it failed 2/2 runs on both versions. `node scripts/run.mjs checks` clean (check-licence, check-fixtures). Klipper semantics checked: `file_position` is the start of the line being executed (klipper@ee2c6fb:klippy/extras/virtual_sdcard.py:283-300), so line-start offsets are the right shape.

Problems:

1. The test cannot fail when the follow path stops moving the marker. `test/integration/follow-feeds.test.ts:47` computes the expected move with `session.reveal(position)`, and `reveal` sends a `seek` to every served webview (`src/application/preview-session.ts:197-199`). So the test moves the marker itself, and then checks that the marker is where it just put it. Probe: in `src/presentation/commands.ts` `follow`, push only the first position and drop all later ones (rebuilt, ran the 4 tests on both versions, restored). All 4 still pass. The worker's probes only caught a preview that never opens (wrong command) or a constant position (fileOffset 0, which the test's own reveal also gets). Expected fix, the rule: the oracle must not drive the behaviour under test. Work out the expected move with no side effects, for example with the pure `resolvePosition` (`src/domain/print-position.ts:93`) on the parsed file, or from a table stored with the fixture. Then wait for `probe.progress(key).move` to reach that move. Re-run the probe above; it must fail.
2. The AC says "recorded" Moonraker feed (as against a "synthetic" Bambu one), and both are ticked, but the Moonraker feed is synthetic (`test/fixtures/feeds/PROVENANCE.md`). That is honest and the shape is right. Still, the card should not claim the criterion is met. Expected: the coordinator rewrites the criterion as "a Moonraker feed in the recorded shape" and opens a follow-up card for a real capture when a Klipper printer is available, or the box stays unticked.

Judgement on the stub running in the test's host: acceptable. It uses only the public surface: `extensions.all` and `activate()` for `exports`, and `executeCommand` with a string URI for the commands. That is exactly what a second extension in the same host would call. The limit has a shortcut comment (`test/integration/stub-extension.ts:4-5`). A real second extension needs `@vsslicer/test-vscode` to take several extension folders; that belongs on a test-vscode card, not here.

For the coordinator: the timeline integration test ("plays, pauses, steps and changes speed") fails on both VS Code versions without this card, so `pnpm test:integration` is red for the module. It needs its own bugfix card.

**Coordinator (sp11-coordinator):** criterion 1 reworded after review 1, problem 2: the feed is in Moonraker's recorded shape (`file_position` at line starts, klipper@ee2c6fb:klippy/extras/virtual_sdcard.py:283-300); a real capture is its own card. Problem 1 (expected position taken from `session.reveal`) still needs the fix.
