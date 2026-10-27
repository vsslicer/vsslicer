# SP5 audit

Date: 2026-10-26. Range: `git diff 4ea462d..HEAD -- vsslicer/` (HEAD `c336d68`, 28 commits, 114 files).
Auditor: fresh Opus agent that wrote none of SP5's code. Read-only: no code changed.
Scope: gcode-api 0.6.0, gcode-bgcode 0.4.3, gcode-parser 0.11.0, gcode-planner 0.4.0, webview-kit 0.5.1,
gcode-preview 0.3.0 and the new gcode-language 0.1.0 (test-webview only re-locked).
Method: `/ponytail:ponytail-audit`, with probes in a scratch `git worktree` of HEAD under the auditor's `mktemp -d`
(frozen-lockfile installs from the local registry; worktree removed afterwards). Probes ran the modules' own
`src` and `dist` in plain Node over the gcode-parser corpus and generated files.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. SP5 made the
G-code preview draw: the webview now uses webview-kit's instanced segment renderer, with colour modes, orbit/pan/zoom,
layer and move sliders, feature toggles, and a timeline (play, pause, step, speed) with a toolhead marker. The
planner gained a toolhead interpolator (`ToolheadWindow`) and Cura flavour names. A new extension, gcode-language,
adds a `gcode` language: a TextMate grammar, a status-bar flavour with a per-file override, and hover, completion
and "unknown command" warnings from a JSON command catalogue (Marlin, Prusa Buddy, Klipper, RRF, Bambu).

Load assumed: one person on a desktop, G-code files up to several hundred MB (10M+ moves) in the preview, text
files up to 50 MB in the editor (VS Code hands nothing larger to extensions), one webview per open file.

## Earlier audit (SP4-audit.md): the fixes hold

1. Klipper planner kept every move (GCP-88): `order.splice(0, head)` once `head > 4096`
   (`gcode-planner/src/domain/klipper.ts:L288-L291`). Probe: 1M-move Klipper file with no G4/M400, planner heap
   peak 32 MB (SP4: 370 MB). Test in `test/trapezoids.test.ts`. Held.
2. Preview ignored `;FLAVOR:` (GCP-89): `ParsedFile.flavourName` (gcode-api), filled by the parser, passed in
   `load-preview.ts:L36`. Probe over the corpus: every file now reports its name (`marlin`, `marlin2`, `klipper`,
   `RepRap`). Held, but the parser and the planner still map the names differently: finding 2.
3. RRF `NaN` after `M204 P0/S0` (GCP-90): `Math.max(v, MIN_ACCEL)` (`rrf-planner.ts:L135-L140`), test
   `rrf.test.ts:L77`. Held.
4. RRF ignored `M204 S` after `P` (GCP-91): `foldAccel` takes the latest of S, P, T (`rrf-planner.ts:L112-L131`),
   test `rrf.test.ts:L90`. 1M moves plan in 1.9 s (Marlin 1.5 s), so the extra fold costs little. Held.
5. Throwing rebuild after context restore (PLT-189): try/catch per rebuild, first error passed to `onRestored`
   (`webview-kit/src/gl/context-loss.ts:L34-L48`), test in `context-loss.test.ts`. Held in the kit, but gcode-preview
   drops the error: finding 4.
6. `checkpointInterval` unchecked (GCP-92): `RangeError` unless integer >= 1 (`klipper.ts:L206-L209`), test
   `klipper.test.ts:L55`. Held.
7. G4 lost in files without moves (GCP-93): `finish` adds `lead` (`timing.ts:L200`), Klipper dwells it when nothing
   is held (`klipper.ts:L473`), constant-speed planner now counts G4; tests in `planner.test.ts`. Held.
8. Typed-array views in `uploadMoveTextures` (PLT-190): `TypeError` in both entry points
   (`move-textures.ts:L64`, `segment-renderer.ts:L160`). Held.
9. Renderer held the CPU buffer (PLT-191): `nextStarts` computed once at create (`segment-renderer.ts:L166-L169`).
   Held (gcode-preview keeps its own copy on purpose for the timeline: see "Checked, no finding").
10. Pooled `latin1ToBytes` (GCP-94): `Buffer.allocUnsafeSlow` (`gcode-bgcode/src/domain/ascii.ts:L83-L87`), test in
    `ascii.test.ts`. Held.
11. Preview re-implemented `bgcodeSource` (GCP-95): `onDiagnostic(d, textOffset)` in gcode-parser, the copy and the
    gcode-bgcode dependency are gone from gcode-preview. Held.

Test runs (scratch worktree, frozen lockfiles): install, lint, build and test green in all seven modules:
gcode-api 13, gcode-bgcode 41, gcode-parser 338, gcode-planner 94, webview-kit 121 (vitest), gcode-preview 52,
gcode-language 24 plus 7 grammar snapshots.

## Must fix

1. **Every Bambu Lab file fills the Problems panel with hundreds of false "unknown command" warnings** (`gcode-language/src/domain/lookup.ts:L23-L28`, `catalogue/marlin.json`, `package.json` `flavourOverrides` enum)
   - **Module / layer:** gcode-language, domain (lookup) and the catalogue data.
   - **What this is:** the extension warns about each G/M/T code that the file's flavour catalogue lacks. Bambu Studio
     and Orca write `; gcode_flavor = marlin` for Bambu printers, so their files use the Marlin catalogue (32 codes).
   - **Problem:** the Marlin list lacks standard Marlin codes (`M400`, `G17`, `M220`) and every Bambu private code
     (`M620`, `M1002`, `M981`...). The 24 `bambu` and 14 Buddy-only entries can never be chosen: detection maps
     `marlin`/`marlin2` to `marlin`, and the override setting only offers marlin, klipper, reprapfirmware. So the
     Bambu catalogue that GCP-47 wrote only shows when the flavour is unknown.
   - **How verified:** probe ran `detectFlavour` + `resolveFlavour` + `unknownCommands` over the gcode-parser corpus:
     `orca/cube-x1c.gcode` 927 warnings, `orca/two-material-x1c.gcode` 1,555, `bambu-studio/cube.gcode` 107 (codes
     include M400, G17, M220, M620, M1002). The GCP-48 card already noted "warnings may be noisy until entries grow".
   - **Fix:** (a) resolve Bambu files to `bambu` (header `; BambuStudio` or Orca's `printer_model = Bambu Lab ...`)
     and let `bambu` and `prusa-buddy` lookups fall back to `marlin`; add both to the override enum. (b) Add the common
     codes the corpus uses (M400, G17, M220, M105, M114, M117, T1...) to marlin.json. (c) Add one test: zero
     unknown-command warnings on every corpus file with its detected flavour. That test keeps it fixed.
   - **If we skip it:** Bambu users, the biggest printer group, see a wall of yellow on every file and stop trusting
     the warnings (or turn the extension off).

## Should fix

2. **The parser, the planner and gcode-language map the same flavour name three ways** (`gcode-parser/src/domain/tag-tables.ts:L96-L105`, `gcode-planner/src/domain/limits.ts:L190-L211`, `gcode-language/src/domain/lookup.ts:L23-L28`)
   - **Module / layer:** gcode-parser, gcode-planner, gcode-language (all domain); the fix lands in gcode-api (domain).
   - **What this is:** GCP-89 taught the planner Cura's names: `RepRap` becomes RepRapFirmware, `Griffin`/`Cheetah`
     become Marlin. The parser still has its own switch (only `klipper` and `reprapfirmware`, all else Marlin), and
     gcode-language a third (`reprap` unknown). The parser's flavour decides units: RRF `M203` is mm/min, Marlin mm/s.
   - **Problem:** a Cura `;FLAVOR:RepRap` file is parsed as Marlin and timed as RRF, so its `M203` limits come out
     60 times too high. The status bar says `RepRap` with no catalogue (no warnings, hovers from any flavour).
   - **How verified:** probe through `loadPreview`: the same 20 moves with `M203 X600 Y600`: `;FLAVOR:RepRap` gave
     planner `reprapfirmware`, 23.7 s; `;FLAVOR:RepRapFirmware` gave the same planner, 400.0 s. The `Flavour` type
     itself is also declared twice (`gcode-parser/src/domain/machine.ts:L11`, `gcode-planner/src/domain/limits.ts:L4`).
   - **Fix:** move `Flavour` and the planner's `flavourFromName` (the complete table) into gcode-api, use it in the
     parser (Marlin when it returns undefined), the planner and gcode-language's `resolveFlavour`. Delete the two
     local copies. One parser test: `;FLAVOR:RepRap` plus `M203 X6000` stores 100 mm/s.
   - **If we skip it:** Cura files for Duet printers get wrong print times, and every new name has to be added in
     three places.

3. **The status bar shows "generic" for every PrusaSlicer, SuperSlicer and non-Bambu Orca file** (`gcode-language/src/domain/flavour.ts:L6`, `src/presentation/status.ts:L12`)
   - **Module / layer:** gcode-language, domain (detection) and presentation (what text it reads).
   - **What this is:** the flavour is read from the first 64 KiB. These slicers write `; gcode_flavor =` in the
     config block at the end of the file.
   - **Problem:** the flavour is unknown, so hover falls back to "the first entry of any flavour". Catalogue files load
     in name order, so Klipper wins: hovering `M204` in a Prusa MK4 file shows Klipper's M204 rules, labelled
     "Flavours: klipper". The preview, which reads the whole file, shows the right flavour.
   - **How verified:** probe over the corpus: all five PrusaSlicer files, the SuperSlicer file and
     `orca/cube-marlin.gcode` detect nothing in the head and `marlin2`/`marlin`/`klipper` in the whole file; the line
     sits 7-15 KB from the end. `lookup(index, undefined, 'M204')` returns the klipper entry; so do M106, G28, M104.
   - **Fix:** also run `detectFlavour` on the last 64 KiB (`doc.positionAt(doc.getText().length - HEAD_BYTES)` or
     `lineCount`-based range), the head winning. Ship it with finding 1 (or after it), or Prusa files start warning
     about M862.x under the Marlin catalogue. Add a fixture with the config block at the end.
   - **If we skip it:** most non-Bambu users never get flavour-aware hovers, completion or warnings, and some hovers
     describe another firmware.

4. **After a failed GPU restore the preview stays blank with no message** (`gcode-preview/src/presentation/webview/preview-renderer.ts:L124-L127`)
   - **Module / layer:** gcode-preview, presentation (webview).
   - **What this is:** PLT-189 made the kit pass the first rebuild error to `onRestored(error)` so the renderer can
     show its failure UI (SP4 finding 5).
   - **Problem:** the preview's hook is `onRestored: () => last && draw(last)`: it ignores the error. When the rebuild
     throws, `renderer` stays undefined, `draw` returns early, and nothing is shown or logged (the kit now catches the
     error, so it no longer even reaches `window.onerror`).
   - **How verified:** read; `grep onRestored` in gcode-preview finds only this line. The kit side is tested.
   - **Fix:** `onRestored: (err) => (err ? showGlFailure(canvas, { cause: 'restore', message: String(err) }) : last && draw(last))`
     (match `GlContextError`'s fields), and one case in `renderer.test.ts` with a throwing rebuild.
   - **If we skip it:** after a driver reset or sleep/wake the preview can go blank silently, the case SP4 asked to fix.

5. **The webview's slider, toggle and saved-view logic has no test** (`gcode-preview/src/presentation/webview/main.ts:L137-L153`, `L231-L261`, `L350-L362`)
   - **Module / layer:** gcode-preview, presentation (webview).
   - **What this is:** main.ts (420 lines) wires the top/bottom layer sliders, the move slider, role and travel
     toggles, the camera and the timeline into one saved state. The rules live inline in DOM handlers: bottom is
     clamped to top, the move count resets when the top layer changes, "all moves" is stored as `undefined`, roles
     flip by XOR on a mask, and play overwrites layer, move and bottom every frame.
   - **Problem:** nothing runs this code in CI. Unit tests cover the pure helpers (`visibleRange`, `timeline.ts`,
     `camera.ts`); the integration test drives only the timeline through the host probe. Inverting the bottom clamp,
     or dropping the `>>> 0` on the role mask, passes every test.
   - **How verified:** read; `grep` of `test/` and `test/integration/preview.test.ts` (no slider, toggle or setState
     assertions); the GCP-35 card's verification lists only the pure helpers and upload counts.
   - **Fix:** move the state rules into one pure function in `controls.ts`, e.g.
     `nextView(state, { kind: 'top' | 'bottom' | 'move' | 'role' | 'travel', value })`, call it from the handlers, and
     test it in plain Node. No DOM test harness needed.
   - **If we skip it:** a later change to the controls breaks a slider or the saved view and only a user notices.

## Nice to have

6. **The unknown-command scan re-reads the whole document after every edit** (`gcode-language/src/presentation/features.ts:L101-L117`, `src/application/features.ts:L89-L98`)
   - **Module / layer:** gcode-language, presentation and application.
   - **Problem:** `scan` runs `doc.getText()` and splits every line, 300 ms after each change, in the extension host
     (shared by all extensions). A 40 MB file (under the 50 MB gate) takes about 0.5 s per scan, and an edit burst
     repeats it.
   - **How verified:** probe: `unknownCommands` on a 39.6 MB, 1.8M-line string: 469 ms (Node, M1 Pro), not
     counting `getText`.
   - **Fix:** scan on open and save only above a few MB (or rescan only the changed line ranges from
     `e.contentChanges`). A one-line size check in `schedule` is enough.

7. **The catalogue lint misses three mistakes it could catch** (`gcode-language/src/domain/catalogue.ts:L28`, `L49-L57`, `L70-L84`)
   - **Module / layer:** gcode-language, domain.
   - **Problem:** (a) flavour names are not checked, so a typo (`klippper`) creates a flavour nothing selects;
     (b) `CODE` accepts `G01`, but lookups normalise to `G1`, so such an entry passes the lint and never shows;
     (c) duplicates are checked per file only: `klipper:M104` is in both `klipper.json` and `reprap.json` today and
     `buildIndex` silently keeps one.
   - **How verified:** read; a probe over the six files found the `klipper:M104` duplicate.
   - **Fix:** a `FLAVOURS` set checked in `validateEntry`, `CODE = /^([GMT](0|[1-9]\d*)(\.\d+)?|[A-Z][A-Z0-9_]+)$/`,
     and run the duplicate check over all files in `loadCatalogue` (then drop G1/M104 for klipper from reprap.json or
     keep it on purpose with a test).

8. **A shortcut in the parser outlived its reason** (`gcode-parser/src/domain/chunk-writer.ts:L12-L14`, `src/application/collect.ts:L14-L15`)
   - **Module / layer:** gcode-parser, domain and application (lean: delete).
   - **Problem:** `NamedChunk` and `ParsedFile & { flavourName?: string }` restate gcode-api's field "so this builds
     against gcode-api 0.5.0 too; drop once the range requires the release that has it". The range is now `^0.6.0`,
     which has `Chunk.flavourName` and `ParsedFile.flavourName`.
   - **Fix:** use `Chunk` and `ParsedFile` directly; about -6 lines.

9. **gcode-language's README and PROVENANCE do not describe what ships** (`gcode-language/README.md:L3`, `PROVENANCE.md`)
   - **Module / layer:** gcode-language, docs.
   - **Problem:** the README still says "A declarative extension: it runs no code", but it now activates on startup and
     provides hover, completion, warnings, a status item and a setting. PROVENANCE covers the grammar and fixtures but
     not the shipped catalogue: that its wording is original, that entries cite RepRap wiki, Marlin, Klipper (GPL-3.0)
     and Duet docs, and that the Bambu entries quote comments from OrcaSlicer@09aa0114 machine templates (AGPL-3.0,
     compatible with the module's AGPL-3.0-or-later).
   - **How verified:** read. A 7-word overlap probe found no Klipper `G-Codes.md`/`Config_Reference.md` text in the
     catalogue; the only overlaps with Orca's BBL machine profiles are the attributed template-comment quotes.
   - **Fix:** a "Features" paragraph (and the setting) in the README, and a "Catalogue" paragraph in PROVENANCE.

## Checked, no finding

- **gcode-language `onStartupFinished`:** needed because VS Code never hands files over 50 MB to extensions, so only
  a tab listener can see them. Activation reads six JSON files (84 KB) synchronously; sizes are cached per URI and
  the "features off" message is shown once per file per session. The 51 MB case has an integration test (GCP-48).
- **Grammar speed:** `pnpm bench`: 20 MB, 885k lines in 4.3 s, and `editor.largeFileOptimizations` turns
  tokenisation off above 20 MB. Adversarial lines (20k-char parameter runs, 16k-char Klipper and string lines,
  nested parentheses) tokenise in 0.3-13 ms; 5,000 nested `{` take 236 ms, below VS Code's per-line limits.
- **Joined move buffer in the webview** (`preview-renderer.ts:L40-L53`): marked `shortcut:` with its limit (two
  copies briefly, about 840 MB at 15M moves; one copy kept for the timeline and bounds). Nothing measured crosses a
  limit at the assumed load, so it stays a decision.
- **Timeline maths** (`timeline.ts`): over all 17 corpus files the planner's start times are finite and never go
  backwards; stepping from 0 reaches the end in one step per distinct start time. Moves with equal start times
  (zero-length moves, up to 1,698 in the arcs file) are stepped over together, as the doc says. The f32 start-time
  resolution (about 4 ms ten hours in) is documented in `interp.ts`.
- **Klipper order splice** (`klipper.ts:L288-L291`): checkpoints still store `order.slice(head)`, the splice runs
  once per 4,096 reported moves over the short unreported tail.
- **RRF M204 fold** (`rrf-planner.ts:L112-L131`): walks state-change buffers once, skips empty buffers, applies a
  change at its own move index like `MoveCursor`; overrides still win.
- **Cura flavour mapping** (`limits.ts:L190-L204`): matches CuraEngine@47b0388 `gcodeExport.cpp:190-216` (written
  names) and `Settings.cpp:373-403`. Cura's 15 printer definitions that use "RepRap (RepRap)" are Duet-class machines
  (SeeMeCNC, Modix, BLV) per Cura@5bea2f8 `resources/definitions`, so RepRap to RRF is right. The corpus's Cura
  file is a Voron set by its user to RepRap (Cura's own Voron definitions use Marlin), so it is timed as RRF.
- **`ToolheadWindow`** (`gcode-planner/src/domain/interp.ts`, GCP-37): not used by the preview yet; the webview's
  constant-speed `positionAt` is marked `shortcut:` and backlog card GCP-97 wires the window in. Buffer walking
  handles empty chunks.
- **Licences:** gcode-language is `AGPL-3.0-or-later` with a full LICENSE; its fixtures are excerpts of the
  gcode-parser corpus and say so. gcode-preview's PROVENANCE now states that `dist/webview.js` ships the libvgcode
  port, and the `/*! */` attribution survives into the bundle (2 matches for `libvgcode` in `dist/webview.js`).
- **`latin1ToBytes('')`**, empty-file preview (no buffers: `concatMoves([])`, no renderer mounted), commands sent
  before a file loads (duration 0: play is refused, step returns 0): no crash.

Verdict: fix 1 first (false warnings on every Bambu file), then 2 and 3 together (one flavour table, read from the
whole file), then 4.

Lean: about -30 lines possible (finding 2 deletes two flavour switches and a type; finding 8 about -6).

Not checked: VS Code integration tests (`test:integration` in gcode-preview and gcode-language, which download VS
Code) and webview-kit's Playwright specs; the webview in a real GPU (rendering, marker placement, per-frame cost of
`setState` and canvas resizing while playing); catalogue wording against marlinfw.org and docs.duet3d.com (not
cloned, so no verbatim check); whether Bambu Studio's own (non-Orca) files carry a header that tells Bambu from
other Marlin printers (finding 1's detection rule needs that checked); the GCP-49 spike (research, no code).

## Cards

| Finding | Severity | Card | Model |
|---|---|---|---|
| 1 False unknown-command warnings on Bambu files; bambu/Buddy catalogues unreachable (gcode board) | must fix (P0) | GCP-98 | opus |
| 2 Flavour names mapped three ways; one table in gcode-api (gcode board) | should fix (P1) | GCP-99 | sonnet |
| 3 Flavour read from the first 64 KiB only (gcode board) | should fix (P1) | GCP-100 | sonnet |
| 4 Preview ignores the context-restore error (gcode board) | should fix (P1) | GCP-101 | sonnet |
| 5 Webview slider/toggle/state logic untested (gcode board) | should fix (P1) | GCP-102 | sonnet |
| 6 Unknown-command scan re-reads the whole document per edit (gcode board) | nice to have (P2) | GCP-103 | sonnet |
| 7 Catalogue lint misses flavour typos, leading zeros, cross-file duplicates (gcode board) | nice to have (P2) | GCP-104 | sonnet |
| 8 Drop the `NamedChunk` shortcut in gcode-parser (gcode board) | nice to have (P2) | GCP-105 | sonnet |
| 9 gcode-language README and PROVENANCE out of date (gcode board) | nice to have (P2) | GCP-106 | sonnet |
