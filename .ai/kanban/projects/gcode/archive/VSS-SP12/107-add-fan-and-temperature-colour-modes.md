---
id: 107
title: Add fan and temperature colour modes
type: feature
priority: P1
effort: L
model: opus
sprint: "VSS:SP12"
depends_on: [96]
created: 2026-10-26
---

Split from GCP-96 at SP6 start: the fan and temperature colour modes, which need per-move fan and temperature from the parser's state changes (a per-move scalar texture or a record change). The choice waits on D17 (move layout), which is proposed, not accepted.

**Code:** `vsslicer/modules/gcode-parser`, `webview-kit`, `gcode-preview` (split per module when planned, rule 13)

## Acceptance criteria

- [x] Fan and temperature modes: per-move fan and temperature reach the shader by the path D17 decides
  - **Settled by the coordinator (SP12, rule 28):** this card is met in `webview-kit` (state changes into the step texture, `ColorMode.Fan` and `ColorMode.Temperature`, legend ranges). The gcode-preview wiring waits for the published `webview-kit@0.8.0` (workers never publish) and moves to GCP-126.
- [x] Switching to either does not re-upload geometry (spyGlUploads test)

## Tasks

- [x] Wait for D17, then choose the scalar path
- [ ] Parser, kit and preview parts

## Progress

Not started. Blocked on D17 (owner decision).

### SP12 (sp12-gcp-107)

- **Path.** D17 is accepted (`decisions/D17-move-layout-and-far-zoom-merge.md`): the 28-byte record stays frozen,
  so fan and temperature do not go into it. They come from the parser's sparse state-change table, folded on the CPU
  into step tables `[firstMove, f32 value]` (the layer table's format) and appended to the kit's one existing
  `RG32UI` step texture, once at creation. The shader looks them up per move by binary search, as layer time does
  (`stepValue`). No new texture unit, no per-move column.
- **Parser:** no change needed. It already records `StateKind.Fan` (M106/M107, `P` index), `HotendTemp`
  (M104/M109, tool index) and `ToolChange`: `gcode-parser/src/domain/machine.ts:116,240,247,251,293`.
- **Kit (`webview-kit`, gl layer):** `ColorMode.Fan` (6, %) and `ColorMode.Temperature` (7, degrees C);
  `createSegmentRenderer(gl, moves, { stateChanges })` takes `ParsedFile.stateChanges`; `stateSteps()` folds them;
  `ranges.fan`/`ranges.temperature` give the legend its default range. The semantics follow OrcaSlicer: the part fan is
  M106 without `P` or with `P1`, and a move's temperature is its active tool's target
  (OrcaSlicer@09aa0114b4e145b89cd61015d8cdf29dbc15b008:src/libslic3r/GCode/GCodeProcessor.cpp:6586-6595,
  6629-6632, 7565-7566; the colouring is libvgcode ViewerImpl.cpp:1766-1770; AGPL-3.0, credited in the shader
  header). The fan starts at 0. An unset temperature is NaN and draws grey. Without `stateChanges`, both modes draw
  grey.
- **Bounds:** at most one step per move, so each table has at most `min(records, moveCount) + 1` rows and is
  allocated up front. The fold is one linear pass. It refuses a buffer that is not an `ArrayBuffer`, a length that
  is not a multiple of 12, a decreasing `moveIndex`, a `moveIndex > moveCount`, and a moveCount that is not a
  non-negative safe integer. No objects are built from input keys. The test asserts the exact cap: moveCount + 1
  rows accepted, a change at moveCount + 1 refused.
- **Preview part not done:** gcode-preview uses the *published* kit (^0.7.0), and workers do not publish. Today
  the webview receives only the move buffers (`preview-session.ts` `deliver`), so the preview also needs a
  state-change stream. That touches main.ts and preview-session.ts, which GCP-55 is editing now. Criterion 1 is
  therefore met in the kit and not yet end to end. **Proposed follow-up card (gcode-preview, presentation and
  application layers, sonnet):** after webview-kit 0.8.0, re-range the kit, send `parsed.stateChanges` to the
  webview as buffers next to the moves, pass them to `createSegmentRenderer`, and add `Fan` (%) and `Temperature`
  (°C) to `COLOR_MODES`/`legendFor` (ranges `fan`, `temperature`). It can extend the existing COLOR_MODES
  spyGlUploads loop in renderer.test.ts.
- **Probes (rule 19).** Each was applied to the source, its test run, and the source restored. All of them fail
  as they should.
  - Criterion 1 (values reach the shader): removing the shader's `uMode == 6u` branch fails the browser test
    "fan and temperature modes colour by the folded state changes", and so does removing `uMode == 7u`. Dropping
    the Fan default range fails it too.
  - Criterion 2 (no re-upload): a `bufferData` in `draw` for modes >= 6 fails the spy test "colour mode and range
    changes upload nothing". Taking Fan and Temperature out of the spy's mode list fails it as well (the exact
    draw count is 8 x 21).
  - Fold guards, against the `stateSteps` unit tests:
    - accepting any fan `P` index fails;
    - dropping later-wins at one move fails;
    - dropping the repeat filter fails;
    - taking a non-active tool's temperature fails;
    - dropping the step at a tool change fails;
    - counting the after-last step in the range fails;
    - fan not starting at 0 fails;
    - removing the order check fails;
    - allowing moveCount + 1 fails;
    - each validation (stride, ArrayBuffer, moveCount) fails when removed. The stride and ArrayBuffer checks first
      passed via DataView's own errors, so those tests now match the message.
  - Without `stateChanges` the moves draw grey: replacing that with an empty fold fails.
- **Verified** in webview-kit: `pnpm install`, `lint`, `build` and `test` pass, with 12 files and 130 tests
  (vitest). `pnpm test:browser` passes 25 of 26 (the new fan/temperature, spy and every-mode chunk tests are among
  them). `memory.spec.ts` (15M moves) timed out at its 300 s limit, twice, at load average 138 with other workers
  running. Without `stateChanges` that path uploads the same textures as before, but I could not confirm under that
  load. **Coordinator: rerun it on an idle machine.** `node scripts/run.mjs checks` fails only in check-licence on
  `modules/3mf` (readPlates.ts, zz-rev401.test.ts), another card's files, not mine. The CI gate runs on Linux
  (SwiftShader Chromium); local runs were on darwin.
- Files: `vsslicer/modules/webview-kit/src/gl/{segment-renderer.ts,segment-shader.ts}`,
  `test/{segment-renderer.test.ts,segment-renderer.page.ts,segment-renderer.spec.ts,gl-upload-spy.page.ts,gl-upload-spy.spec.ts}`.
  Notes: `.reference/notes/GCP-107-fan-temperature-modes.md`.

Release lines:

- webview-kit CHANGELOG (minor, 0.8.0): `Added: fan and temperature colour modes (GCP-107). ColorMode.Fan (part-cooling fan duty, %) and ColorMode.Temperature (hotend target of the move's tool, °C). createSegmentRenderer takes the parser's state-change tables as the stateChanges option, folds them into step tables in the existing step texture and exposes ranges.fan and ranges.temperature. Switching modes still uploads nothing.`
- webview-kit README, `colorMode` bullet (line 123): add `, Fan (part fan %, needs stateChanges: ParsedFile.stateChanges) or Temperature (the move's tool's hotend target, °C, needs stateChanges); without them both are grey`.
- Exports: none new (`ColorMode` is already exported from `./gl`; `stateSteps` stays internal).

**Review passed (sp12-rev-gcp-107)**

Checked against the coordinator's settled criterion 1 (met in `webview-kit`; gcode-preview wiring is GCP-126,
which exists in backlog). Criterion 1 ticked on that basis; the "Parser, kit and preview parts" task stays open
for GCP-126.

- **Ran** in `vsslicer/modules/webview-kit`: `pnpm install`, `pnpm lint`, `pnpm build` pass; `pnpm test` 12 files,
  130 tests pass. `pnpm test:browser` **26 of 26 pass (4.6 min), memory.spec.ts (15M moves) included**, at load
  average about 50: this settles the worker's rerun request. `cd vsslicer && node scripts/run.mjs checks` exits 0
  (84 runner tests; check-licence and check-fixtures clean).
- **Mutation probes** (in a `mktemp -d` copy of the module), each failing as it should:
  - `stateSteps` unit tests: table sized `min(records, moveCount)` instead of `+ 1` (2 fail; the cap test asserts
    exactly 6 rows); fan `P` 0 only; any fan `P`; no x100 scaling; no repeat filter; after-last step counted in the
    range; no order check; `moveCount + 1` allowed; no step at a tool change; non-active tool's temperature taken;
    non-finite values in the range.
  - Browser (`segment-renderer.spec.ts`, `gl-upload-spy.spec.ts`; unmutated baseline 7 of 7 pass): remove the
    shader's `uMode == 6u` branch; remove `uMode == 7u`; temperature reading the fan rows; temperature rows at the
    fan offset; drop `ranges.fan` from the default ranges: each fails "fan and temperature modes colour by the
    folded state changes". A `bufferData` in `draw` for modes >= 6 fails the spy test "colour mode and range
    changes upload nothing" (criterion 2).
  - Survives, and is equivalent: dropping `value !== tool` (the repeat filter removes the same row).
- **Hostile probes** on `stateSteps`: ToolChange values 300, NaN, -1, 1.5 and Infinity are ignored (the
  temperature stays the T0 one); hotend index 255 with tool 255 works; moveIndex 0xffffffff throws RangeError;
  a SharedArrayBuffer or typed array throws TypeError; moveCount 2^53-1 allocates only `records + 1` rows; unknown
  kind 255 is ignored. No objects are keyed by input, so `__proto__`/`constructor` do not apply.
- **Upstream:** the OrcaSlicer lines quoted (`09aa0114`, GCodeProcessor.cpp:6586-6595, 6629-6632, 7565-7566)
  match the clone at that commit. One divergence the parser forces: it records M106 without `P` as index 0, so the
  kit also takes `P0` as the part fan, and M107 `P2`+ does not zero it (Orca ignores `P` on M107). Doc comment
  updated to say so (comment-only fix).
- **Layering:** `src/gl` is browser-only, no VS Code, no cross-module imports (the gcode-api record constants
  are copied with a pointer to their source).
- **Fixed in place (no behaviour change):** `createSegmentRenderer`'s JSDoc had two lines without the leading
  ` * ` (segment-renderer.ts:259-260); the `stateSteps` comment notes the P0/M107 divergence. Lint re-run clean.
- **Non-blocking notes for the coordinator:** (1) the ToolChange guard (`Number.isInteger(value) && value >= 0
  && value < 256`) has no test: removing it leaves all 14 unit tests green. The hostile probe shows it behaves
  correctly, but one test row with a bad tool value would pin it. (2) A negative value (fan from a non-parser
  producer, or `M104 S-5`) gets into `ranges.*` but draws grey, because the shader treats `< 0` as unknown. A
  legend could show a negative bound. Neither is a criterion.
