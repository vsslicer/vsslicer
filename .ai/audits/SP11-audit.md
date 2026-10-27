# SP11 audit

Date: 2026-10-26. Range: `git diff ff7ee29b..HEAD -- vsslicer/` (code up to `022fac12`; the commits after it touch
only the board). That is 475 files and about 70,100 added lines. Most of them are data: the profiles-data-orca trees,
the Orca and Bambu golden files (about 21,000 lines), the tuple fixtures and the Prusa INI fixtures. The new source
under `src/` is about 2,800 lines. The rest is tests, the mesh bench and CI.

Auditor: `sp11-auditor`, a fresh Opus agent that wrote none of SP11's code. Read-only: I changed no code, no cards and
no git state. The only file I wrote is this report. The working tree holds uncommitted GCP-55 follow-mode work in
gcode-preview (`follow-state.ts`, webview changes). It is not in the range and I did not audit it.

Scope:
- First, whether the SP10 findings (14 cards) and the four SP9 cards carried into SP11 were fixed, and whether the
  fixes hold.
- Then the sprint's new code that reads untrusted input or writes files other programs read:
  - 3mf: `readProject` and the dialect dispatch (VWR-20), Bambu and Orca config, presets and objects (VWR-21,
    VWR-22), PrusaSlicer 2.x (VWR-25), Cura containers (VWR-27) and the worker (VWR-31)
  - the native exports: Prusa INI (PRF-52), Orca and Bambu JSON (PRF-53), Cura (PRF-54)
  - Orca user presets (PRF-29) and Cura machine instances (PRF-127)
  - the tuple oracles (PRF-42, PRF-128, PRF-129)
- Then gcode-preview (GCP-51, GCP-52, GCP-53, GCP-54, GCP-118), the mesh bench and admesh oracle (VWR-45, VWR-50,
  VWR-75, VWR-76) and the CI steps they added.
- The leads in `.ai/local/sp11/retro-notes.md`: the flaky tests (slicer-runtime, gcode-preview integration,
  profiles-orca, 3mf) and VWR-25's untested paths.

Method: `/ponytail:ponytail-audit`.
- Two forked helpers each took one area: 3mf; and the profile exports, user presets, Cura instances and oracles. I
  took the SP10 and SP9 fixes, gcode-preview, printer-api, slicer-runtime, mesh, CI and the retro leads.
- Every probe ran in a `mktemp -d` directory and loaded a module's `src/` by absolute path under Node 26.12. The
  directories were deleted afterwards (helper B left `/tmp/sp11b`, which can be deleted).
- Real upstream data was only read, from `.reference/repos`. I ran no upstream code. Helper B ran one
  `python3 -I -c 'ast.literal_eval("true")'` to confirm Uranium's parser rule.
- Full suites, one run each. All pass:

  | Module | Tests |
  |---|---|
  | 3mf | 293 |
  | profiles-prusa | 323 |
  | profiles-orca | 158 |
  | profiles-cura | 159 |
  | printer-api | 43 |
  | slicer-runtime | 80, plus 1 skipped |
  | mesh | 90, plus 1 skipped (admesh is not installed here) |
  | gcode-preview | 113 (unit; includes the uncommitted GCP-55 tests) |

Load assumed: one person on a desktop opening project files and profile folders they downloaded or exported from
another slicer, and exporting profiles back to PrusaSlicer, Orca, Bambu Studio and Cura. Big painted Bambu and Orca
projects (hundreds of thousands of triangles) are normal. A printer feed sends positions several times a second.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. In SP11:
- 3mf learned to read the project data of Bambu Studio, Orca, PrusaSlicer 2.x and Cura, in a worker.
- The profile modules learned to write their native formats back (Prusa INI, Orca and Bambu JSON, Cura), to read
  Orca user presets and Cura machines, and to check resolved values against upstream oracles.
- gcode-preview maps printer positions to moves, has a public API with a semver gate, and was tested from a stub
  extension.
- mesh was released with a time and memory bench and admesh as its oracle in CI.

## Earlier audits: the fixes

All twelve SP10 cards that were due are done, and they hold. PLT-203 (finding 14) waits on PRF-193 (SP13), as the
SP10 coordinator decided. The four SP9 cards carried into SP11 are done; PRF-198 holds only in part.

| Finding | Card | Result |
|---|---|---|
| SP10-1 Prusa model and preset with the same name | PRF-202 | Holds. Probe on `PrusaSlicer-settings/live`: Sovol gives 208 entities and 0 "already imported" warnings. `SV06` is the model, its nozzle is `printer:SV06`, and the model's `nozzles` lists `printer:SV06`. Jubilee keeps `printer_model:Jubilee` and `printer:Jubilee`. |
| SP10-2 five PrusaSlicer keys in the SuperSlicer list | PRF-203 | Holds. The five keys are gone, the comment says 351. |
| SP10-3 cut heater or tray ids | PRN-446 | Holds. `byKey` compares the key after the same 256-character cut (`printer-api/src/domain/status.ts:L285-L288`), with a test. |
| SP10-4 Orca tree diagnostics | PRF-204 | Holds. `pushCapped` (`read-tree.ts:L144-L152`) is used by both readers, and `loadProfileTree` counts every folder entry. |
| SP10-5 `host_type` of `constructor` | PRF-205 | Holds (`Object.hasOwn`). |
| SP10-6 nozzle defaults lost | PRF-206 | Holds. Both keys go back into `native_only` in `splitVariants`. |
| SP10-7 `unescapeStrings` copy | PRF-207 | Holds. Deleted, `splitList` is used. |
| SP10-8 inherited-keys cap | PRF-208 | Holds (1,000,000). |
| SP10-9 Cura `__proto__` container | PRF-209 | Holds. `native` and `unmapped` are null-prototype. |
| SP10-10 `curaStackValue` comment | PRF-210 | Holds. |
| SP10-11 `null` list item | PRN-447 | Holds. `item()` refuses non-objects in both entry points. |
| SP10-12 symlink collision | SLC-281 | Holds. `EEXIST` from `symlink` becomes `ArchiveError`, with a test. |
| SP10-13 `detectDialect` case and slash | VWR-398 | Holds (helper A probed it). |
| SP10-14 runner dev-cycle code | PLT-203 | Waits on PRF-193 (SP13). |
| SP9-2 follow position before the moves | GCP-118 | Holds. The last revealed move is posted again after the last buffer, and is forgotten when another plate loads. Both cases are tested in `test/follow.test.ts`. |
| SP9-3 YAML diagnostics cap | PRF-195 | Holds. Tests at 10,000 bad variants and 5,000 vendor documents. |
| SP9-9 YAML documents and the node cap | PRF-196 | Holds. Bare `---` lines count as nodes, with a test. |
| SP9-11 test-only `readBounded` | PRF-198 | Half. Deleted from profile-api, but the copy in profile-catalogue-data is still there. See finding 14. |

## Must fix

1. **A painted Bambu or Orca object over about 125,000 triangles crashes the 3MF worker**
   (`3mf/src/adapters/worker/handle.ts:L22-L24` `collectBuffers`; card VWR-31)
   - **Module / layer:** 3mf, adapters (worker).
   - **What this is:** `collectBuffers` walks the result to find the buffers it can hand to the caller without
     copying. It puts each array's items on its work stack with `stack.push(...v)`.
   - **Problem:** spreading an array of more than about 125,000 items into one call overflows the call stack. The
     Bambu reader keeps the painting data (`triangleAttributes`) as one string per triangle. So any painted object
     that size throws `RangeError: Maximum call stack size exceeded`. `handle` rethrows anything that is not a
     `ThreeMfError`, the worker dies, and the user sees "worker-crashed". More than 125,000 objects, instances or
     parts do the same.
   - **How verified (helper A):** `collectBuffers` alone works at 100,000 strings and throws at 130,000, 200,000 and
     1,000,000. End to end through `handle({bytes})`: an `OrcaSlicer-2.3.0` model with 140,000 triangles and
     `paint_color` throws; the same model with 100,000 triangles works; without Application metadata (plain core
     read) it works at 140,000.
   - **Fix:** replace both spreads with loops: `for (const x of v) stack.push(x)`, and the same for
     `Object.values(v)`. Add one test: `collectBuffers` on a 200,000-item array.
   - **If we skip it:** large painted Bambu and Orca projects, which are common, never open through the worker.

2. **A Cura machine whose id has a space loses its nozzle size**
   (`profiles-cura/src/adapters/instances/read.ts:L43-L49` `stemOf`, used at `L117`; card PRF-127)
   - **Module / layer:** profiles-cura, adapters (instances).
   - **What this is:** the reader finds a machine's `definition_changes` container by id. The id comes from the file
     name, because Cura writes no `id` in `[general]` (`Uranium@e65ccc1:UM/Settings/InstanceContainer.py:L503-L506`).
   - **Problem:** Uranium saves a container as `quote_plus(id)` and reads the id back with `unquote_plus`
     (`Uranium@e65ccc1:plugins/LocalContainerProvider/LocalContainerProvider.py:L111, L369, L395`). Cura names that
     container `<machine id>_settings` (`Cura@5bea2f8:cura/Settings/CuraStackBuilder.py:L174`), and machine ids
     usually hold spaces ("Creality Ender-3"). `stemOf` does not decode the name, so the lookup misses. The
     module's other readers already decode it (`definitions/read.ts:L106` `unquotePlus`).
   - **How verified (helper B):** `machine_instances/Creality+Ender-3.global.cfg` naming `Creality Ender-3_settings`,
     plus `definition_changes/Creality+Ender-3_settings.inst.cfg` with `machine_nozzle_size = 0.6`, gave
     `toolheads: []` and the warning "nozzle size not set in definition_changes". The test fixtures use ids without
     spaces.
   - **Fix:** export `unquotePlus` from `definitions/read.ts`, use it in `stemOf`, and add one test with a `+` in the
     file name.
   - **If we skip it:** most real Cura machines import without a nozzle.

3. **Cura export writes a boolean as `true`, which Cura cannot read**
   (`profiles-cura/src/adapters/export/cura/write.ts:L42-L47` `valueText`; card PRF-54)
   - **Module / layer:** profiles-cura, adapters (export).
   - **Problem:** `String(true)` gives `true`. Uranium reads bool settings with `ast.literal_eval`
     (`Uranium@e65ccc1:UM/Settings/SettingDefinition.py:L826`), which accepts only `True` and `False`. A list or object
     holding booleans breaks the same way through `JSON.stringify`.
   - **How verified (helper B):** `settings: {support_enable: true}` wrote `support_enable = true`, and
     `ast.literal_eval("true")` raises `ValueError: malformed node`. Imported values stay strings, so only edited or
     converted values are hit.
   - **Fix:** write booleans as `True` and `False` in `valueText`, with one test row.
   - **If we skip it:** the first edit of a Cura checkbox, or any profile converted to Cura, gives a file with an
     invalid setting.

4. **A backslash in G-code is lost when a profile is written to Prusa INI**
   (`profiles-prusa/src/adapters/export/prusa/serialize.ts:L63`, `L104-L105` `coString: escape(unescape(raw))`;
   card PRF-52)
   - **Module / layer:** profiles-prusa, adapters (export); the fix also touches the import.
   - **What this is:** an edited string value is unescaped, then escaped again before it is written.
   - **Problem:** the same unified key holds text in two forms. The Prusa importer keeps the escaped INI text
     (newline as `\n`, backslash as `\\`). Orca, Bambu and Cura values are decoded text, with real newlines and single
     backslashes. `unescape` eats every single backslash. The test at `test/adapters/export-prusa.test.ts:L73` pins
     the mixed form.
   - **How verified (helper B):** an entity with `machine_start_gcode: 'G28\nM117 C:\\temp'` (one backslash) wrote
     `start_gcode = G28\nM117 C:temp`. Editing an imported Prusa printer's end G-code to `M84 ; C:\temp` read back as
     `M84 ; C:temp`.
   - **Fix:** make decoded text the unified form. The Prusa importer unescapes `coString` values (the rule
     `notes.ts:L9-L10` already uses), and `canon('coString')` becomes `escape(raw)`. Unedited keys are still written
     from their stored text, so files still round-trip. This changes what Prusa unified strings hold, so it needs
     design judgment (model=opus).
   - **If we skip it:** converting a profile from Orca, Bambu or Cura to Prusa silently changes G-code that holds a
     backslash, and Prusa-imported G-code shows a literal `\n` to every other consumer.

## Should fix

5. **`readProject` parses the whole root model twice** (`3mf/src/readProject.ts:L18-L19` `readMetadata`, called at
   `application/readProject.ts:L31-L33`; card VWR-20)
   - **Module / layer:** 3mf, the public entry and application.
   - **What this is:** to pick the dialect, `readMetadata` runs a full `readModel` (every vertex and triangle) only to
     get the `<metadata>` lines. The core read or the dialect reader then parses the same bytes again, and a third
     time when a reader fails and falls back to core.
   - **How verified (helper A):** a 39 MB root model with 500,000 triangles: one `readModel` takes 930 to 1,160 ms;
     `readProject` takes 2,040 to 2,150 ms for orca, prusa2 and core.
   - **Fix:** keep the parsed model in a `WeakMap<Uint8Array, CoreModel>` keyed by the bytes, so `readMetadata`,
     `readCore` and the readers share one parse.
   - **If we skip it:** every project open takes about twice as long as it needs to.

6. **Prusa export can return two files whose names differ only in case**
   (`profiles-prusa/src/adapters/export/prusa/export.ts:L177`, `L182-L185` `paths`; card PRF-52)
   - **Module / layer:** profiles-prusa, adapters (export).
   - **Problem:** `paths` compares exact strings. Filaments `Generic PLA` and `generic pla` both come out, as
     `filament/Generic PLA.ini` and `filament/generic pla.ini`. On macOS and Windows the second write replaces the
     first. The Cura exporter already compares lower case (`profiles-cura/src/adapters/export/cura/write.ts:L69-L74`).
   - **How verified (helper B):** read, and compared with the Cura exporter. The probe was not run.
   - **Fix:** key `paths` on `path.normalize('NFC').toLowerCase()`, as `profiles-orca/.../read-user-presets.ts:L139`
     does, and refuse or rename the second one. One test.
   - **If we skip it:** presets imported on Linux and exported on a Mac silently lose a file.

7. **No test checks that the shipped `readProject` reaches the PrusaSlicer 2.x reader**
   (`3mf/test/readProject.test.ts:L104-L118`; card VWR-25, retro lead)
   - **Module / layer:** 3mf, tests.
   - **What this is:** the only test through the public `src/readProject.ts` is a fixture loop. It accepts any
     dialect from a list and never checks `notices`. The other tests rebuild the wiring by hand
     (`readPrusa2.test.ts:L160-L167`, `readBambu.test.ts:L21-L22`).
   - **Problem:** delete `['prusa2', readPrusa2]` from `src/readProject.ts` and no test fails:
     `fdm_roundtrip1.3mf` opens as core with an "it has no reader" notice and still passes the loop.
   - **How verified (helper A):** read the tests, and ran the public `readProject` on every fixture:
     `fdm_roundtrip1.3mf` reads as prusa2 with no notices, and nothing pins that. The deletion was not run as a
     mutation.
   - **Fix:** in the loop, `expect(p.notices ?? []).toEqual([])`, and pin `fdm_roundtrip1.3mf` to `prusa2`.
   - **If we skip it:** a wiring slip drops PrusaSlicer 2.x projects back to plain 3MF without a failing test.

8. **The `p:path` refusal on a PrusaSlicer 2.x build item has no test**
   (`3mf/src/adapters/prusa/readPrusa2.ts:L138`, `L152`; card VWR-25, retro lead)
   - **Module / layer:** 3mf, tests.
   - **Problem:** `place` refuses a production path on components and on build items, but
     `readPrusa2.test.ts:L297-L299` tests only components. If the `item.path` argument at L152 were dropped, the
     reader would look the id up in the root model and could place the wrong object.
   - **How verified (helper A):** read the code and grepped the tests.
   - **Fix:** one row: `<build><item objectid="1" p:path="/3D/o.model"/></build>` expects `/production paths/`.
   - **If we skip it:** the refusal can stop working unnoticed.

9. **Four slow tests have no timeout of their own, and fail CI under load**
   (`3mf/test/opc.test.ts:L113` "reads every Cura 3MF mesh"; `profiles-orca/test/read-tree.test.ts:L240` "default
   merge budget stops a fan-out" and its "golden counts" test; retro leads)
   - **Module / layer:** 3mf and profiles-orca, tests.
   - **Problem:** each runs against vitest's 5 s default, and neither module sets `testTimeout`. They pass alone but
     failed under the parallel release and full runs: the 3mf test once, the profiles-orca test in 2 of 3 runs.
   - **How verified:** run alone, the 3mf test takes 584 ms (helper A), the profiles-orca ones 1,512 ms and 3,234 ms
     (helper B). The coordinator saw the failures under load.
   - **Fix:** pass `{ timeout: 30_000 }` to each, as `3mf/test/worker.test.ts` already does with its `guard`.
   - **If we skip it:** releases fail at random on load alone, and somebody pipes the output away again (13:37 slip).

10. **The slicer-runtime test "grandchildren in the group are killed" races the kill**
    (`slicer-runtime/test/run-process.test.ts:L57-L62`; retro lead from SLC-281's review)
    - **Module / layer:** slicer-runtime, tests.
    - **Problem:** `runProcess` resolves when the shell exits. The grandchild `sleep` got the same signal but may not
      have exited and been reaped yet, so `process.kill(pid, 0)` still finds it, and the test fails. The reviewer saw
      it fail 1 run in 8.
    - **How verified:** read. The suite passed in my one run.
    - **Fix:** poll for `ESRCH` for up to the guard, for example 50 tries 20 ms apart, then assert. The production code
      does not need to change.
    - **If we skip it:** a random red CI run on macOS and Linux about 1 time in 8.

11. **The gcode-preview timeline integration test packs about ten waits into one 20 s mocha timeout**
    (`gcode-preview/test/integration/preview.test.ts:L76-L104`; mocha `timeout: 20000` in `test-vscode/runner.cjs:L19`;
    retro lead from GCP-53)
    - **Module / layer:** gcode-preview, tests (integration).
    - **Problem:** the test opens the file, waits for every buffer, then for speed, play, pause, a 500 ms still check,
      two steps and play to the end. Each `until` may take up to 10 s, and the 16 min 42 s print needs at least 2 s
      of real playing at 500×. Any slow step on a loaded machine or a busy VS Code pushes the whole test past 20 s.
      The coordinator saw it time out on VS Code stable and 1.100.0, also with GCP-53's test removed.
    - **How verified:** read; I did not run the integration suite. That the webview animation is throttled on CI is
      a guess, not verified.
    - **Fix:** `this.timeout(60_000)` on that test (an `it` with `function`), and play to the end at a higher speed,
      for example 5,000×.
    - **If we skip it:** gcode-preview releases keep failing at random.

## Nice to have

12. **The Bambu reader does not cap its notices** (`3mf/src/adapters/bambu/readObjects.ts:L165-L168`; card VWR-22)
    - **Module / layer:** 3mf, adapters (bambu).
    - **Problem:** each component that names a missing object adds one notice, up to `MAX_COMPONENTS` (100,000). The
      Cura and Orca readers stop at 1,000 plus one "suppressed" line.
    - **How verified (helper A):** a 2.5 MB model with one object holding 100,000 components that name a missing
      object gave 100,000 notices.
    - **Fix:** stop at 1,000 notices and add one "N more suppressed" line, with one test.
    - **If we skip it:** a hostile file shows about 100,000 lines to the user. The cost stays bounded.

13. **The API gate misses a new required field in a type the caller builds**
    (`gcode-preview/etc/check-api.ts:L14-L17` `breakingLines`; card GCP-54)
    - **Module / layer:** gcode-preview, tooling.
    - **What this is:** a line removed or changed in `etc/gcode-preview.api.md` counts as breaking; an added line
      never does.
    - **Problem:** `PrintPosition` and `OpenOptions` are built by other extensions. Adding `plate: number;` to
      `OpenOptions` is one added line, so `apiProblems` returns `[]` and CI passes, but every caller that passes `{}`
      stops compiling. Its own test (`test/api-check.test.ts:L8`) only covers an added method on `GcodePreviewApi`,
      which really is additive.
    - **How verified:** read the code and the test.
    - **Fix:** also count an added line as breaking when it is a required member (no `?`) inside an interface the
      caller passes in. The simplest form: treat any added line inside `PrintPosition` or `OpenOptions` without `?:`
      as breaking. One test row.
    - **If we skip it:** a breaking change to the follow API ships under the same contract version.

14. **PRF-198 removed `readBounded` from only one of the two generator copies**
    (`profile-catalogue-data/tools/catalogue/cura.ts:L45-L49`, `L563-L567`)
    - **Module / layer:** profile-catalogue-data, tools (lean: delete).
    - **Problem:** `readBounded`, `CURA_SOURCE` and `FDM_MATERIALS_SOURCE` are still exported there. A grep of the
      module (excluding `node_modules` and `dist`) finds no user of any of them. The two copies, which must change
      together until PRF-193, now differ by one more block.
    - **Fix:** delete the same lines there, about 15 lines.
    - **If we skip it:** dead code in the copy that becomes the only one after PRF-193.

15. **The admesh oracle passes URL paths to admesh** (`mesh/test/oracle/admesh.test.ts:L101` `join(dir.pathname, f)`)
    - **Module / layer:** mesh, tests.
    - **Problem:** `URL.pathname` keeps `%20` for a space (and gives `/C:/...` on Windows). In a checkout under
      `~/My Projects` with admesh installed, admesh cannot open the file and the test fails.
    - **How verified:** read. CI installs admesh only on Linux runners, whose paths have no spaces.
    - **Fix:** `fileURLToPath(new URL(f, dir))`.
    - **If we skip it:** the oracle fails for a developer whose path has a space.

## Checked, no finding (probes run)

- **3mf (helper A).**
  - Dispatcher: a core package gets no notice. A disabled, missing or failing reader falls back to core with a
    notice. Errors of the core read itself still propagate.
  - Config values are kept in Maps, so a `__proto__` key stays data. Part names are matched in lower case.
  - Bambu object ids: a clashing id takes the next free one, the component walk stops at 100,000 references, and
    meshes are shared, not copied. `printable_area` is parsed only from configs up to 16 MB and 4,096 points.
  - Prusa2: nesting stops past 10 levels and leaf instances at 100,000. Triangle and vertex ranges are checked for
    bounds and overlap.
  - Workers: a pooled input view is copied before transfer, a detached input rejects with a typed error, a client
    settles once and ends its worker, and Node out-of-memory maps to `worker-out-of-memory`.
  - All six real fixtures read with no notices.
- **Prusa INI export (helper B).** Stored keys and values with a line break are refused. An edited enum goes through
  `unifiedToNative`, so `marlin2\ntravel_speed = 999` is refused. `safeKey` blocks `=`, `[`, `#` and `;`, and
  `safeName` refuses `/`, `\`, `.`, `..` and control characters. An unedited preset round-trips byte for byte.
  `types.ts` (643 lines) is a table of PrusaSlicer option types with no logic; not a lean finding.
- **Orca and Bambu JSON writer (helper B).** The BOM, CRLF and four-space indent round-trip. A changed member keeps
  the file's layout, a new one is appended, a removed one is cut.
- **Orca user presets (helper B).** Paths go through `safePath`, sidecar and settings objects are null-prototype,
  `base/` wins a clash. Diagnostics are not capped, but there are at most about 2 per file, bounded by `maxFiles`.
- **Cura export and instances (helper B).** File names are URI-encoded with a leading `.` encoded. Values with
  newlines continue as `\n\t`, which `Uranium@e65ccc1:UM/FastConfigParser.py:L18` reads without key injection.
  Instance diagnostics are capped, `native` is null-prototype, and the credential is removed from the metadata.
- **Tuple oracles (helper B).**
  - Prusa (PRF-42): hand-checked values with their upstream line numbers.
  - Orca and Bambu (PRF-128): golden files from the real OrcaSlicer CLI. The Bambu tree is resolved by OrcaSlicer, not
    Bambu Studio. Known differences are reconciled by rules picked automatically (156 of 3,746 Orca keys, 98 of 2,044
    Bambu keys), and `empty-default` (6 uses) accepts any empty value. A wrong merge order fails, so the oracle can
    catch a regression.
  - Cura (PRF-129): an independent Python merge. The material slot is empty, so material resolution is not covered.
- **gcode-preview.** `resolvePosition` warns, not throws, on a file offset past the last move, under a `shortcut:`
  comment that names its limit. The API gate runs in CI against the PR base with `fetch-depth: 0`, and an empty-tree
  base skips the compare.
- **mesh bench (VWR-50).** Memory is gated, time only recorded. There is no linux budget yet, so the CI step records
  one and uploads it instead of gating, as its CI comment says. There is no remote yet, so no CI run has recorded it.
- **printer-api.** A cut id from a base matches the full id in the next push; two different ids that share their
  first 256 characters were already refused as duplicates when the base was built.
- **Architecture.** No `vscode` import outside `presentation/` in the changed modules. No relative import into another
  module.

## Not checked

- The uncommitted GCP-55 work in gcode-preview.
- The VS Code integration suites (gcode-preview, including GCP-53's stub-extension tests), the Playwright webview
  tests and the mesh Chromium bench.
- Real large Bambu or Orca projects from the field; finding 1 was shown with a synthetic file.
- The 3mf Web Worker path in a real webview; only the MessageChannel stand-in.
- A real Cura `machine_instances` folder (none was available, as PRF-127 says), and what Cura does after
  `literal_eval` fails.
- `generate-golden.ts` and `cura_oracle.py` were not run, and no mutation run of the tuple tests.
- Windows-reserved names and trailing dots or spaces in exported Prusa and Cura file names.
- The admesh oracle itself: admesh is not installed here, so its test was skipped.
- profiles-data-orca's test slowness under load (13:37 lead): not re-run.

Verdict: fix finding 1 first (large painted Bambu and Orca projects crash the worker), then findings 2 to 4, which
write or read profile values wrong. All SP10 fixes that were due hold.

Lean: -15 lines possible (finding 14), -0 dependencies.

## Cards


Created by the SP11 coordinator in SP12 (`sprint: VSS:SP12`), linked to this report.

| Finding | Severity | Board | Model | Card |
|---|---|---|---|---|
| 1 Collect worker transfer buffers without spreading into push | must fix (P0) | viewer | sonnet | VWR-400 |
| 2 Decode quote_plus'd Cura machine instance file names | must fix (P0) | profiles | sonnet | PRF-212 |
| 3 Write Cura booleans as Python literals | must fix (P0) | profiles | sonnet | PRF-213 |
| 4 Keep single backslashes when writing converted G-code to Prusa INI | must fix (P0) | profiles | opus | PRF-214 |
| 5 Parse the 3MF root model once in readProject | should fix (P1) | viewer | sonnet | VWR-401 |
| 6 Refuse Prusa export file names that differ only in case | should fix (P1) | profiles | sonnet | PRF-215 |
| 7 Test that the public readProject reaches the prusa2 reader | should fix (P1) | viewer | sonnet | VWR-402 |
| 8 Test the p:path refusal on a prusa2 build item | should fix (P1) | viewer | sonnet | VWR-403 |
| 9 Hang-guard timeouts on the slow tests (3mf opc; profiles-orca read-tree) | should fix (P1) | viewer, profiles | sonnet | VWR-404, PRF-216 |
| 10 Wait for the grandchild to exit in the runProcess kill test | should fix (P1) | slicer | sonnet | SLC-282 |
| 11 Timeline integration test waits | should fix (P1) | gcode | sonnet | GCP-124 (existing, SP12) |
| 12 Cap the Bambu reader's notices | nice to have (P2) | viewer | sonnet | VWR-405 |
| 13 Flag new required fields in caller-built types in the API gate | nice to have (P2) | gcode | opus | GCP-125 |
| 14 Delete the second test-only readBounded copy | nice to have (P2) | profiles | sonnet | PRF-217 |
| 15 Pass file paths to admesh in the oracle test | nice to have (P2) | viewer | sonnet | VWR-406 |
