# SP4 audit

Date: 2026-10-26. Range: `git diff dbaad77..HEAD -- vsslicer/` (HEAD `39a31c1`, 28 commits).
Auditor: fresh Opus agent that wrote none of SP4's code. Read-only: no code changed.
Scope: gcode-api 0.5, gcode-bgcode 0.4.2, gcode-parser 0.10.1, gcode-planner 0.3, new gcode-preview 0.2.1,
webview-kit 0.5 (new `gl` entry, `testing` entry, window channel and transfer changes), test-webview.
Method: `/ponytail:ponytail-audit`, with probes in scratch `git worktree`s under `mktemp -d` (frozen-lockfile
installs from the local registry, read only; all worktrees removed afterwards). webview-kit and gcode-planner
were audited by two forks of this auditor in parallel; their findings were checked against the probes below.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. SP4 added
the first user-facing extension, `gcode-preview` (a read-only custom editor for `.gcode` / `.bgcode` that parses
and plans in a worker thread and streams the move buffers to a webview), the RepRapFirmware and Bambu planners,
arc handling, Klipper trapezoid replay with checkpoints, G4 and `ESTIMATOR_ADD_TIME` time markers, a
`.bgcode` source for the parser, a parser benchmark, and webview-kit's WebGL2 segment renderer (ported from
OrcaSlicer libvgcode) with GL-state save/restore and context-loss rebuild.

Load assumed: one person on a desktop, G-code files up to several hundred MB (10M+ moves), one webview per open
file that may reload many times; the preview worker runs with a 1 GiB JS heap cap (`worker-loader.ts:L17`).

## Earlier audit (SP3-audit.md): the fixes hold

1. Klipper `NaN` on zero velocity / accel: Klipper, Marlin and Bambu stay finite on zero-value state changes
   and overrides (fork probe). The same bug exists in the new RRF planner: finding 3.
2. Reused stream id after reload: `receiveBuffers` clears its finished-id set on every `hello`
   (`webview-kit/src/application/transfer.ts:L136-L137`), and gcode-preview uses `crypto.randomUUID()` per load. Held.
3. Slow `.bgcode` conversion: `bytesToLatin1` / `latin1ToBytes` now use Node `Buffer` (`gcode-bgcode/src/domain/ascii.ts:L80-L82`). Held; see finding 10 for a side effect.

Test runs (scratch worktree): gcode-preview 23 pass and lint clean, gcode-parser 335, gcode-bgcode 40,
gcode-api 13, gcode-planner 79, webview-kit 116 vitest + 16 Playwright specs (SwiftShader). All green.

## Must fix

1. **The preview cannot open a Klipper file of about 90 MB: the Klipper planner keeps every move in memory** (`gcode-planner/src/domain/klipper.ts:L246`, `L263-L285`)
   - **Module / layer:** gcode-planner, domain. Felt in gcode-preview (adapters: the worker).
   - **What this is:** `order` lists every parser move still waiting to be reported. Reported moves are skipped
     with `head++` but only removed when the lookahead queue drains fully (`order.length = 0` at `L282`), which
     happens only at a G4, an M400, a macro delay or the end of the file.
   - **Problem:** a Klipper file with no G4/M400 in the middle (the normal case for Orca/Prusa Klipper output)
     keeps one `KMove` object (about 20 fields, about 370 bytes) for every move until the end.
   - **How verified:** fork probe: 1M-move zigzag peaks at 370 MB of heap with no markers, 0 MB extra with an
     M400 every 1000 moves, same total time (133285.3 s). End to end with the built `dist/worker.js` and
     `workerLoader`: an 89 MB, 3M-move file with `; gcode_flavor = klipper` fails with `memory-cap` ("preview
     worker exceeded 1073741824 bytes") after 5.3 s; the same file with an M400 every 1000 moves opens in 1.7 s.
   - **Fix:** after the `while` loop in `commit`, drop the reported prefix: `if (head > 4096) { order.splice(0, head); head = 0; }`.
     Checkpoints already store `order.slice(head)` (`L371`), so replay is unaffected. Add a test that `order`
     stays short on a long file without markers (or a heap bound on a 1M-move file).
   - **If we skip it:** every mid-size Klipper print shows "Could not open this file (memory-cap)" in the preview.

## Should fix

2. **The preview ignores the file's `;FLAVOR:` header, so it picks the wrong planner** (`gcode-preview/src/application/load-preview.ts:L50`, `gcode-api/src/domain/parsed-file.ts:L141-L164`)
   - **Module / layer:** gcode-preview (application), gcode-api (domain), gcode-parser (domain).
   - **What this is:** `resolveLimits` picks the flavour from `flavour` (the header name) or else
     `config.gcode_flavor`. The planner README (`gcode-planner/README.md:L8`) says to pass the header name, but
     `ParsedFile` does not carry it, so `loadPreview` passes only `config`.
   - **Problem:** the parser does read `;FLAVOR:` (`gcode-parser/src/domain/slicer-tags.ts:L69-L71`) and uses
     it for units and G4, while the planner never sees it: the same fact, two answers. A file with
     `;FLAVOR:Klipper` and no config block is timed by the Marlin planner; every Cura file (`;FLAVOR:Marlin`)
     shows "marlin assumed".
   - **How verified:** `workerLoader` on built `dist/worker.js`: a 1M-move file starting `;FLAVOR:Klipper` gave
     planner `marlin`; adding `; gcode_flavor = klipper` in a config block gave `klipper`. A `;FLAVOR:Marlin`
     file and the Cura fixture `cube-cylinder-4.10.0.gcode` both returned `flavourAssumed: true`, `flavourName: undefined`.
   - **Fix:** add `flavourName?: string` to `ParsedFile` (gcode-api), have the parser fill it with the name it
     read, and pass `flavour: parsed.flavourName` in `loadPreview`. One test in gcode-preview's `load.test.ts`.
   - **If we skip it:** Klipper or RRF files from slicers without a config block get Marlin print times, and Cura
     users see an "assumed" warning on files that state their flavour.

3. **The RRF planner returns `NaN` for the whole print after `M204 P0` or `M204 S0`** (`gcode-planner/src/domain/rrf-planner.ts:L103-L109`, `L145`, `duration` at `L42-L53`)
   - **Module / layer:** gcode-planner, domain.
   - **What this is:** the parser passes M204 values unchecked (`gcode-parser/src/domain/machine.ts:L304-L306`);
     `accelCap` uses the value as the acceleration.
   - **Problem:** acceleration 0 divides by zero, so `totalTime` is `NaN`. Real RRF clamps M204 to at least
     0.1 mm/s² (`RepRapFirmware@aebf629:src/GCodes/GCodes5.cpp:344-354`, `src/Config/Configuration.h:56`). This
     is SP3 finding 1 again, in the new planner.
   - **How verified:** fork probe, 8 moves with an AccelPrint 0 / Accel 0 state change at move 2: RRF `NaN`;
     Klipper, Marlin, Bambu finite.
   - **Fix:** `Math.max(value, 0.1)` in `accelCap`; two cases in `test/rrf.test.ts`.
   - **If we skip it:** one odd M204 line in a Duet file shows "NaN" as the print time.

4. **The RRF planner ignores `M204 S` once the file has set `M204 P`** (`gcode-planner/src/domain/rrf-planner.ts:L106-L108`)
   - **Module / layer:** gcode-planner, domain (or gcode-parser, domain, for the fix below).
   - **What this is:** in RRF, `M204 S` sets both print and travel acceleration (`GCodes5.cpp:344`).
   - **Problem:** the planner reads P whenever P was ever set and falls back to S only otherwise, so `M204 P100`
     then `M204 S5000` keeps printing at 100.
   - **How verified:** fork probe: P100 then S5000 gave 19.69 s, P100 alone 19.69 s, S5000 alone 7.30 s.
   - **Fix:** use whichever was set last. Smallest: the parser emits AccelPrint and AccelTravel changes for
     `M204 S`, and the fallback branch goes away. One test.
   - **If we skip it:** Duet prints that switch acceleration with `M204 S` get the wrong time.

5. **If one GL rebuild throws after a context restore, the view stays blank with no message** (`webview-kit/src/gl/context-loss.ts:L34-L38`)
   - **Module / layer:** webview-kit, gl (browser presentation).
   - **What this is:** after `webglcontextrestored` the tracker re-creates every registered resource, then calls `onRestored` (the redraw).
   - **Problem:** no try/catch around a rebuild. One throw (shader compile fails, a create call returns null)
     stops the loop: later resources are not rebuilt, `onRestored` never runs, the failed entry keeps its stale
     free function, and the error only reaches `window.onerror`. The comment at `L35` says the loop runs over the
     live Map; it runs over a copy.
   - **How verified:** fork vitest probe, two entries, the first throws on rebuild: second not rebuilt, `onRestored` not called.
   - **Fix:** try/catch per rebuild, finish the loop, pass the first error to `onRestored(error?)` so the
     renderer can show `showGlFailure`. Fix the comment; one case in `test/context-loss.test.ts`.
   - **If we skip it:** after a GPU reset (driver update, sleep/wake) the preview can stay blank silently, once the renderer is wired in.

6. **`KlipperOptions.checkpointInterval` is not checked** (`gcode-planner/src/domain/klipper.ts:L244`, `gcode-planner/src/domain/timing.ts:L99-L104`, `L133-L138`)
   - **Module / layer:** gcode-planner, domain.
   - **What this is:** the interval goes to `TimingBuilder` unchecked; `resolution` next to it is checked (`klipper.ts:L205`).
   - **Problem:** -1 or 0.5 takes a `structuredClone` snapshot after (almost) every move; 0 or `NaN` keeps only
     the checkpoint at move 0, so every `trapezoidsFor` replays from the start. Results stay correct.
   - **How verified:** fork probe, 20,000 moves: 100 gives 200 checkpoints in 13 ms; -1 gives 20,001 in 503 ms;
     0.5 gives 2,472; 0 and `NaN` give 1, and a 10-move window costs 17.8 ms instead of 0.1 ms.
   - **Fix:** one line next to the `resolution` check: `RangeError` unless `Number.isInteger(ci) && ci >= 1`.
   - **If we skip it:** a bad option value makes big files plan very slowly or makes every scrub replay the whole file. No caller passes it yet.

## Nice to have

7. **A G4 pause in a file with no moves is lost** (`gcode-planner/src/domain/timing.ts:L185-L188`, `L198`; `klipper.ts:L404`, `L463`)
   - **Module / layer:** gcode-planner, domain.
   - **Problem:** time before the first move is held until the first move is recorded; with no moves it never is.
     A file with no moves and one 30 s `G4` gives `totalTime` 0 in all five planners.
   - **How verified:** fork probe over klipper, marlin, reprapfirmware, prusa-buddy, constant-speed.
   - **Fix:** in `finish`, `this.time += this.lead`; in Klipper also add `lead` when `held` is undefined at the end.
   - **If we skip it:** macro-only or start-script-only files show 0 s. Rare.

8. **`uploadMoveTextures` uploads wrong data, without an error, when handed a typed-array view** (`webview-kit/src/gl/move-textures.ts:L56-L95`, the `new Uint32Array(moves, at, length)` at `L90`; `segment-renderer.ts:L60`)
   - **Module / layer:** webview-kit, gl.
   - **Problem:** TypeScript rejects a view, so only JS / `as any` callers hit it: `new Uint32Array(view, ...)`
     copies each byte into one 32-bit word, so the data is scrambled and four times too long. `createSegmentRenderer` throws instead.
   - **How verified:** fork probe with `new Uint8Array(buf, 28, 56)` on a fake GL: 56 words of byte values instead of 14 real words.
   - **Fix:** `if (!(moves instanceof ArrayBuffer)) throw new TypeError(...)` in both entry points.
   - **Related, decide before wiring the renderer into gcode-preview:** the parser gives one move buffer per chunk
     (`gcode-api/src/domain/parsed-file.ts:L148`) but the renderer wants one contiguous buffer: a full copy, about 420 MB briefly at 15M moves.

9. **The segment renderer keeps the whole CPU move buffer alive to read one number per texture chunk** (`webview-kit/src/gl/segment-renderer.ts:L163-L168`)
   - **Module / layer:** webview-kit, gl.
   - **Problem:** `const words = new Uint32Array(moves)` is captured by `nextStart` for draw time, so a caller
     that drops its buffer after upload still holds it (420 MB at 15M moves) until `dispose`.
   - **How verified:** read; grep shows `words` has no other use.
   - **Fix:** compute `const next = chunks.map(nextStart)` once at create and use `next[i]` in draw.

10. **`latin1ToBytes` returns a pooled Node Buffer, and needs Node in the domain layer** (`gcode-bgcode/src/domain/ascii.ts:L80-L82`)
    - **Module / layer:** gcode-bgcode, domain.
    - **Problem:** `Buffer.from(s, 'latin1')` for a string under 4 KiB returns a view into Node's shared 8 KiB
      pool, so `.buffer` is not the text: `new Uint8Array(latin1ToBytes('G1').buffer).length` is 8192, and
      transferring that `.buffer` would detach other Buffers. Today's callers are safe (`gcode-parser`
      `worker-host.ts:L81` copies before transferring; the preview parses in the same thread). The module also
      no longer runs without Node (a web extension host or the webview).
    - **How verified:** read callers (`to-gcode.ts:L56-L57`, `bgcode-source.ts`, `load-preview.ts:L20-L35`); Node's documented pool rule.
    - **Fix:** `const b = Buffer.allocUnsafeSlow(s.length); b.write(s, 'latin1'); return b;` (own ArrayBuffer, same speed).
      Note the Node requirement in the README until a browser user exists.

11. **gcode-preview re-implements the parser's `bgcodeSource`** (`gcode-preview/src/application/load-preview.ts:L20-L35` vs `gcode-parser/src/adapters/bgcode-source.ts:L24-L34`)
    - **Module / layer:** gcode-preview, application (lean: merge).
    - **Problem:** two near-copies of the same decode chain; the preview's adds only the text offset to each
      diagnostic, and it depends on gcode-bgcode only for this and the codecs that `bgcodeSource` already bundles.
    - **Fix:** pass the reached offset in `bgcodeSource`'s `onDiagnostic` (or count it in a 3-line wrapper), use it
      in `loadPreview`, and drop the codecs option and the `@vsslicer/gcode-bgcode` dependency from gcode-preview.
    - **If we skip it:** a fix to bgcode decoding has to be made twice.

## Checked, no finding

- **webview-kit `createWindowChannel` (PLT-39), `src/adapters/webview-window.ts:L53-L58`:** any same-origin message
  now passes, including the page's own, but handshake and transfer drop anything without the kit's tag
  (`protocol.ts:L109`), so three.js, devtools or polyfill messages cannot trigger a handler, reload or mismatch.
  Only same-origin script can forge the tag, and it already runs in the page.
- **`sendBuffer` chunk copy, `transfer.ts:L63`:** one 1 MiB copy per chunk, correct for views with a byte offset and for Node Buffers.
- **libvgcode attribution:** `src/gl/segment-shader.ts:L1-L9` cites OrcaSlicer@09aa0114 with files, lines, the
  Prusa Research copyright and the ORCA changes; upstream is AGPL-3.0-or-later and webview-kit is
  `AGPL-3.0-or-later` with a full LICENSE. The header survives into `dist`. gcode-preview's `PROVENANCE.md`
  correctly says the `gl` entry is not bundled yet.
- **GL state save/restore, `src/gl/gl-state.ts`:** saves everything the renderer's create and draw change; the three-foreign spec proves it.
- **Klipper checkpoints:** one `structuredClone` of the whole loop state keeps shared queue / arc-group objects
  linked, so replay matches the full pass (property test); 13 ms for 20,000 moves at the default interval 4096.
- **`trapezoidsFor` throwing for non-Klipper planners:** documented (planner README L30-L32, CHANGELOG GCP-23);
  nothing outside the module's tests calls it.
- **gcode-preview worker banner:** `__importMetaUrl` from `pathToFileURL(__filename)` works (probes ran the
  built `dist/worker.js`). The bundle carries gcode-parser's unused `parseInWorker` (`new URL('./worker-entry.js', ...)`,
  a file that does not exist in `dist/`); harmless while nothing calls it.
- **gcode-parser bench budgets (`bench/budget.json`):** machine-specific (Apple M1 Pro, Node v26.12.1, not the
  project's Node 24) but only gate a manual `pnpm bench`; nothing in CI runs it.
- **G4 / `ESTIMATOR_ADD_TIME` markers in the parser:** S-over-P for Marlin/RRF, P-only for Klipper, negative and
  non-finite to 0; a bare `ESTIMATOR_ADD_TIME` with no number is dropped. Matches the cited firmware lines.

Verdict: fix 1 first (the preview fails on ordinary Klipper files), then 2 and 3; 5 and 8-9 before the renderer is wired into the preview.

Lean: about -20 lines and -1 dependency (gcode-preview on gcode-bgcode) possible (finding 11).

Not checked: VS Code integration tests (`test:integration` for gcode-preview and webview-kit, which need a VS
Code download); planner accuracy against real firmware or real prints; how often real Klipper files lack mid-file
G4/M400 (finding 1 used a synthetic file; Orca/Prusa Klipper output normally has none); the Marlin and Buddy
planner diffs line by line; RRF with `F0` (fork saw 120 s vs Marlin's 0.23 s on the same moves, unexplained);
shader correctness beyond the passing SwiftShader specs.

## Cards

All in SP5 (`sprint: VSS:SP5`), `type: bug`, linking this report:

| Finding | Severity | Card | Model |
|---|---|---|---|
| 1 Klipper planner holds every move until G4/M400 | must fix (P0) | GCP-88 | sonnet |
| 2 Preview ignores the `;FLAVOR:` header | should fix (P1) | GCP-89 | opus |
| 3 RRF NaN after M204 P0/S0 | should fix (P1) | GCP-90 | sonnet |
| 4 RRF ignores M204 S after M204 P | should fix (P1) | GCP-91 | sonnet |
| 5 A throwing rebuild skips the rest after context restore | should fix (P1) | PLT-189 | sonnet |
| 6 `checkpointInterval` unvalidated | should fix (P1) | GCP-92 | sonnet |
| 7 G4 lost in files with no moves | nice to have (P2) | GCP-93 | sonnet |
| 8 `uploadMoveTextures` and typed-array views | nice to have (P2) | PLT-190 | sonnet |
| 9 Renderer holds the CPU move buffer | nice to have (P2) | PLT-191 | sonnet |
| 10 `latin1ToBytes` returns a pooled view | nice to have (P2) | GCP-94 | sonnet |
| 11 `bgcodeText` duplicates `bgcodeSource` | nice to have (P2) | GCP-95 | sonnet |
