# SP12 audit

Date: 2026-10-26. Range: `git diff dc0746eb..HEAD -- vsslicer/` (code up to `692f6480`; the two commits after it
touch only the board). That is 157 files and about 8,600 added lines. About 3,400 of them are new source under
`src/`, most of it in profiles (store, file store, watcher, worker), the profiles-orca bundles and instances,
profiles-cura (`.curaprofile`, resource download) and 3mf (plates, layer data). The rest is tests, fixtures and spikes.

Auditor: `sp12-auditor`, a fresh Opus agent that wrote none of SP12's code. Read-only: I changed no code, no cards and
no git state. The only file I wrote is this report. Raw notes from the helpers are in `.ai/local/sp12/audit-a.md`,
`audit-b.md` and `audit-c.md`.

Scope:
- First, whether the 15 SP11 findings (cards VWR-400 to VWR-406, PRF-212 to PRF-217, SLC-282, GCP-124, GCP-125) were
  fixed, and whether the fixes hold.
- Then the sprint's new code that reads untrusted input, writes files the user keeps, or runs across processes:
  - profiles: the store and its index (PRF-44), the import use cases (PRF-38), the file store with atomic writes and
    edit protection (PRF-45), the watcher (PRF-46), installed folders (PRF-36) and the import worker (PRF-39)
  - profiles-orca: Orca and Bambu bundle import and export (PRF-106 to PRF-109) and Orca printer instances (PRF-90)
  - profiles-cura: `.curaprofile` read and write (PRF-112, PRF-113) and the resource download (PRF-130)
  - 3mf: Bambu and Orca plates and slice info (VWR-23), layer data and cuts (VWR-24), the round-trip test (VWR-29) and
    the 500 MB test (VWR-32)
  - gcode-preview: follow mode (GCP-55) and the stale-feed and file checks (GCP-56); webview-kit's fan and temperature
    modes (GCP-107)
- The leads in `.ai/local/sp12/retro-notes.md`: the unidentified mesh test failure under load (VWR-406).

Method: `/ponytail:ponytail-audit`.
- Three forked helpers each took one area: A took 3mf and mesh; B took profiles-orca, profiles-cura, profiles-prusa
  and profile-catalogue-data; C took profiles. I took the SP11 fixes outside those areas, gcode-preview, webview-kit,
  slicer-runtime and gcode-parser.
- Every probe ran in a `mktemp -d` directory and loaded a module's `src/` by absolute path under Node 26.12. The
  directories were deleted afterwards. Helper C left two small `tmp.*` folders from its watcher probe under `$TMPDIR`;
  they can be deleted.
- Upstream code was only read, from `.reference/repos`. Nothing upstream was run, and no real network fetch was made.
- Full suites, one run each unless noted. All pass:

  | Module | Tests |
  |---|---|
  | 3mf | 386 (3 more sequential and 3 parallel runs passed; 2 of 5 runs under heavy load failed one test each, see finding 5) |
  | mesh | 91, plus 1 skipped (admesh is not installed here) |
  | profiles | 107 |
  | profiles-orca | 212 |
  | profiles-cura | 220 |
  | profiles-prusa | 328 |
  | profile-catalogue-data | 26 |
  | gcode-preview | 123 (unit) |
  | webview-kit | 130 (unit) |
  | slicer-runtime | 80, plus 1 skipped |
  | gcode-parser | 362 |

Load assumed: one person on a desktop with one or two VS Code windows on the same workspace. They import profiles
and bundles they downloaded or got from other people, edit them in the workspace, sometimes edit them outside VS Code
or move folders around, and follow a print whose printer sends a position several times a second. Big painted Bambu
and Orca projects are normal.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. In SP12:
- profiles got its store: an index over the user's profile files, imports run in a worker, atomic saves that refuse
  a concurrent edit, and a watcher that re-indexes files edited outside VSSlicer.
- The profile modules learned to read and write Orca and Bambu bundles and `.curaprofile` files, to read Orca printer
  instances, and to download Cura's resources when Cura is not installed.
- 3mf learned to read Bambu and Orca plates, slice info, layer data and cuts, and got round-trip and 500 MB tests.
- gcode-preview follows a print in the editor, stops on a stale feed or a different file, and colours by fan and
  temperature.

## Earlier audits: the fixes

All 15 SP11 findings are fixed, and the fixes hold. Two leave a sibling of the same bug elsewhere: VWR-406 (the same
URL-path pattern is still in a 3mf test, finding 11) and GCP-125 (the gate's list of caller-built types misses the
`FileCheck` type SP12 added, finding 6).

| Finding | Card | Result |
|---|---|---|
| SP11-1 `collectBuffers` spread | VWR-400 | Holds. Loops instead of `push(...v)` (`3mf/src/adapters/worker/handle.ts:L22-L25`); `worker.test.ts:L218` runs 200,000 items (helper A). |
| SP11-2 Cura machine id with a space | PRF-212 | Holds. `stemOf` decodes with `unquotePlus` (`profiles-cura/src/adapters/instances/read.ts:L48`); the test uses `Creality+Ender-3` (helper B). |
| SP11-3 Cura booleans | PRF-213 | Holds. `True`/`False` (`export/cura/write.ts:L42`). A boolean inside a list still writes `[true]`, but no setting in `Cura@5bea2f8:resources/definitions/fdmprinter.def.json` holds a list of booleans (helper B). |
| SP11-4 backslash lost in Prusa INI | PRF-214 | Holds. The importer decodes `coString` values (`profiles-prusa/src/adapters/import/flatten.ts:L28-L39`), as `PrusaSlicer-2.9@b028299:src/libslic3r/Config.cpp:128-150` does; the writer only escapes. Tests cover Orca to Prusa with `C:\temp`, edit and read back, unedited files byte for byte, and a trailing backslash (helper B). |
| SP11-5 root model parsed twice | VWR-401 | Holds. `readModelOnce` is a `WeakMap` keyed on the bytes; no direct `readModel` call is left in `src/`, and the test pins one parse per fixture, also on a reader failure with core fallback. No reader mutates the shared model (helper A). |
| SP11-6 export names that differ only in case | PRF-215 | Holds. NFC plus lower case (`profiles-prusa/src/adapters/export/prusa/export.ts:L199-L201`, `L248`), tested with `Generic PLA`/`generic pla` and two forms of `café` (helper B). |
| SP11-7 public `readProject` to prusa2 | VWR-402 | Holds. The fixture loop asserts no notices and pins `fdm_roundtrip1` to `prusa2` (helper A). |
| SP11-8 `p:path` on a build item | VWR-403 | Holds (helper A). |
| SP11-9 slow tests without a timeout | VWR-404, PRF-216 | Holds. 3mf sets `testTimeout: 30_000` module-wide; the profiles-orca fan-out test has 30 s (`read-tree.test.ts:L247`). |
| SP11-10 grandchild kill race | SLC-282 | Holds. The test polls `kill(pid, 0)` up to 50 times 20 ms apart and rethrows anything but `ESRCH` (`slicer-runtime/test/run-process.test.ts:L63-L73`). |
| SP11-11 timeline integration test | GCP-124 | Holds by reading: `this.timeout(60_000)` and speed 2000 before playing to the end (`gcode-preview/test/integration/preview.test.ts:L76-L77`, `L100`). The integration suite was not run. |
| SP11-12 Bambu notice cap | VWR-405 | Holds. 1,000 plus one "suppressed" line, and the test asserts the exact cap (helper A). |
| SP11-13 API gate and caller-built types | GCP-125 | Holds for `PrintPosition` and `OpenOptions`. It misses `FileCheck`, added in SP12 by GCP-56: finding 6. |
| SP11-14 second `readBounded` copy | PRF-217 | Holds. Deleted; grep finds no users. The guard test it added is finding 12. |
| SP11-15 admesh URL paths | VWR-406 | Holds in mesh: no `.pathname` is left there. The mesh failure under load seen during SP12 did not reproduce in 3 parallel runs (helper A). |

## Must fix

1. **Saving a profile can overwrite a different file from the one the user sees**
   (`profiles/src/adapters/fs-store/fs-store.ts:L180-L181` against `profiles/src/application/store/profile-store.ts:L69-L72`;
   cards PRF-45, PRF-44)
   - **Module / layer:** profiles, adapters (fs-store) against application (store).
   - **What this is:** when two files in the user's folder hold the same id, the store shows one of them, and the file
     store remembers one of them as the file to save to.
   - **Problem:** they pick different files. The file store keeps the first path in its walk, which is depth first by
     name, so `material/PLA/x.json` comes before `material/PLA-old.json`. The store picks the smallest full path, and
     there `-` sorts before `/`, so `PLA-old.json` wins. A save goes to the file the user is not looking at.
   - **How verified (helper C):** both files with id `material:x`, notes A and B. The index shows A. Saving
     `{...A, note: 'EDIT'}` returned `written: true`, after which `PLA/x.json` held A plus EDIT (B was gone) and
     `PLA-old.json` was unchanged, so after a reload the index still shows A and the edit seems lost.
   - **Fix:** keep the path the store would pick: `if (!known.has(k) || path < known.get(k)!) known.set(k, path)`.
     One test with this pair of files.
   - **If we skip it:** a duplicate id in a subfolder silently destroys another profile's content, and the user's edit
     seems to vanish.

## Should fix

2. **Moving or deleting a whole profile folder is never re-indexed** (`profiles/src/adapters/fs-store/watch/watch.ts:L113`;
   card PRF-46)
   - **Module / layer:** profiles, adapters (fs-store watch).
   - **What this is:** the watcher re-reads the profiles when files change outside VSSlicer. It skips every event whose
     name does not end in `.json`, to ignore its own temp and lock files.
   - **Problem:** moving a folder in or out, or sending it to the Trash, raises one event named after the folder. That
     event is skipped.
   - **How verified (helper C):** with the real `fs.watch` on macOS, renaming `root/material/sub` (holding `a.json`) to a
     folder outside the root gave one raw event, `rename material/sub`. After 1.5 s there had been 0 reloads, and
     `list('material')` still returned 1.
   - **Fix:** skip only the store's own temp and lock names (the `.tmp` and `.lock` suffixes it writes), and reload on
     anything else. One test row: an event named `material/sub` reloads.
   - **If we skip it:** profiles stay listed after their folder is gone, and a folder of profiles copied in does not
     show up, until some `.json` file changes.

3. **A crafted `layer_heights_profile.txt` takes over 1 GB of memory before the notice cap applies**
   (`3mf/src/adapters/bambu/readLayerData.ts:L174-L184`, cap applied at `L260-L261`; card VWR-24)
   - **Module / layer:** 3mf, adapters (bambu).
   - **What this is:** the reader adds one notice for each bad or empty line, and cuts the list to 20 only at the end.
   - **Problem:** the part may be 16 MB, which is about 16.7 million empty lines, and newlines compress to almost
     nothing, so the 3MF stays tiny. Every line becomes a notice string first.
   - **How verified (helper A):** a 16 MB part of `\n` gave 16,777,215 notices, +1,138 MB heap and 1,378 MB peak RSS in
     2.5 s, then was cut to 21.
   - **Fix:** count notices past the cap instead of pushing them, as `readObjects` does, and use the same helper in
     `readPlates` (its cap is also applied late, though its 200,000-element walk bounds it). Stop the line loop after
     `MAX_LAYER_ENTRIES`. One test with 1,000,000 bad lines that expects exactly 21 notices.
   - **If we skip it:** a small hostile 3MF runs the worker out of memory, or crashes the webview's worker.

4. **Importing a bundle keeps a printer's host address and API key**
   (`profiles-orca/src/adapters/bundles/orca/import-orca-bundle.ts:L99`, `L148`;
   `profiles-orca/src/adapters/bundles/bambu/import-bambu-bundle.ts:L71-L73`; cards PRF-106, PRF-108)
   - **Module / layer:** profiles-orca, adapters (bundles).
   - **What this is:** a bundle is a zip of presets that Orca or Bambu Studio exports. Both importers copy every key of
     a printer preset, and the Orca importer also keeps the raw file in `native`.
   - **Problem:** a hand-made or third-party bundle holding `print_host`, `printhost_apikey` or `printhost_password`
     puts someone's printer address and key into the profile store, which is files in the workspace. Both apps erase
     these keys when they export (`OrcaSlicer@09aa0114:src/slic3r/GUI/ExportPresetBundleDialog.cpp:236-243`,
     `BambuStudio@79df7ae:src/slic3r/GUI/CreatePresetsDialog.cpp:3716-3731`), and Bambu Studio also on load
     (`BambuStudio@79df7ae:src/libslic3r/Preset.cpp:2243-2250`). Our exporters erase them too, so nothing leaks out
     again; the problem is only what is stored.
   - **How verified (helper B):** a zip with `printer/My.json` holding all three keys. Both importers kept them, and the
     Orca `native` held the key as well.
   - **Fix:** drop the same keys from printer presets on import, in both importers. The list is written twice today
     (`bundles/orca/export-orca-bundle.ts:L17`, `bundles/bambu/export-bambu-bundle.ts:L23`); make it one exported
     constant and use it in all four places. One import test.
   - **If we skip it:** a shared bundle puts a stranger's printer address and API key into the user's workspace, where
     it can be committed to git.

5. **A heap assert in the 3mf tests fails under load** (`3mf/test/resolveProject.test.ts:L220-L223`; card VWR-390, older
   than SP12, but it failed in this audit's runs and would fail an SP12 release)
   - **Module / layer:** 3mf, tests.
   - **What this is:** the test compares `heapUsed` before and after a capped read, without forcing garbage collection.
   - **Problem:** whether garbage is collected in between depends on what else runs, so the number moves.
   - **How verified (helper A):** alone it takes 169 ms and stays well under the limit. With five suites running at
     once it measured 108,251,976 bytes against the 100 MB limit, in 1 of 5 runs.
   - **Fix:** force a GC before both readings (`v8.setFlagsFromString('--expose-gc')` and `vm.runInNewContext('gc')()`),
     or drop the heap check: the cap's own error is already asserted.
   - **If we skip it:** 3mf releases fail at random under load, as the SP11 slow tests did.

## Nice to have

6. **The API gate misses a new required field in `FileCheck`** (`gcode-preview/etc/check-api.ts:L14`; cards GCP-56,
   GCP-125)
   - **Module / layer:** gcode-preview, tooling.
   - **What this is:** `CALLER_BUILT` lists the interfaces other extensions build and pass in, where a new required
     member breaks every caller. GCP-56 added `follow(uri, position, file?: FileCheck)`, so `FileCheck` is now one of
     them, but the list still holds only `PrintPosition` and `OpenOptions`.
   - **How verified (me):** a probe added `crc: string;` to each interface in the real `etc/gcode-preview.api.md`.
     `OpenOptions` gave one problem; `FileCheck` gave `[]`.
   - **Fix:** add `FileCheck` to `CALLER_BUILT`, with one test row. (A missing space after `newly required:` in the
     message at `L58` can go in the same change.)
   - **If we skip it:** a breaking change to the file check ships under the same contract version.

7. **Breaking a stale lock can let two writers in at once** (`profiles/src/adapters/fs-store/fs-store.ts:L111-L126`,
   release at `L226`; card PRF-45)
   - **Module / layer:** profiles, adapters (fs-store).
   - **Problem:** this needs a lock left by a crashed writer (older than `STALE_LOCK_MS`, 30 s) and two windows saving
     the same profile at once. Both see the old lock as stale; A removes it and takes a new lock, then B, acting on its
     earlier check, removes A's lock and takes its own. Both then save, and the first edit is lost without a conflict.
     The release in `finally` can also delete another writer's lock.
   - **How verified (helper C):** read only, not probed.
   - **Fix:** write a random token into the lock. Break a stale lock by renaming it to a unique name and checking that
     the renamed file is the one judged stale; release only a lock that still holds our token. Needs design judgment.
   - **If we skip it:** a rare lost edit, only after a crash.

8. **The Bambu importer names a preset by its file name and drops its `name` key silently**
   (`profiles-orca/src/adapters/bundles/bambu/import-bambu-bundle.ts:L22`, `L52`; card PRF-108)
   - **Module / layer:** profiles-orca, adapters (bundles).
   - **Problem:** Bambu Studio names an imported preset by the JSON `name` key
     (`BambuStudio@79df7ae:src/libslic3r/PresetBundle.cpp:1117`). Ours uses the file name with no warning; the Orca
     importer warns in the same case.
   - **How verified (helper B):** `filament/a.json` holding `"name": "Real PLA"` imported as `a` with no diagnostic.
     Studio saves files as `<name>.json`, so only renamed or hand-edited entries are hit.
   - **Fix:** when `name` is a string that differs from the file name, give the same `malformed-line` warning the Orca
     importer gives. One test.
   - **If we skip it:** a renamed entry imports under a name Studio would not give it.

9. **Two custom G-code blocks for the same plate become two entries** (`3mf/src/adapters/bambu/readLayerData.ts:L119-L125`;
   card VWR-24)
   - **Module / layer:** 3mf, adapters (bambu).
   - **Problem:** upstream puts both into one slot, `plates_custom_gcodes[plate_id - 1]`
     (`OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp:3434-3466`). We return two entries with the same `plateId`,
     and keep negative ids.
   - **How verified (helper A):** a probe gave plate ids `[-3, -3]`.
   - **Fix:** merge items into the entry for that plate id, and skip ids below 1 with a notice. One test row.
   - **If we skip it:** only odd or hostile files are hit; a consumer keyed by plate sees duplicates.

10. **A follow shows one warning per position past the last move** (`gcode-preview/src/presentation/commands.ts:L141`;
    card GCP-56)
    - **Module / layer:** gcode-preview, presentation.
    - **What this is:** errors during a follow are shown once per follow (`outOfRange`, `L147-L151`). Warnings from a
      reveal are shown every time.
    - **Problem:** a file offset past the last move is clamped with a warning that names the offset. A printer that
      reads on through the end G-code and the config comment block at the end of the file reports a new offset several
      times a second, and each one opens a new notification.
    - **How verified (me):** read; `test/follow.test.ts:L496-L499` pins one warning for one such position and nothing
      for a second one.
    - **Fix:** show a reveal warning only once per follow, with the same flag. One more push in that test.
    - **If we skip it:** the end of every followed print can stack a few identical-looking warnings.

11. **3mf real-file tests skip silently when the checkout path has a space** (`3mf/test/editPackage.test.ts:L130`;
    older than SP12, the same bug VWR-406 fixed in mesh)
    - **Module / layer:** 3mf, tests.
    - **Problem:** `new URL(...).pathname` keeps `%20`, so `existsSync` is false and the tests are skipped, not run.
    - **How verified (helper A):** read.
    - **Fix:** `fileURLToPath(new URL(...))`.
    - **If we skip it:** such checkouts lose that coverage, and nothing shows it.

12. **A test that guards only that deleted code stays deleted** (`profile-catalogue-data/test/dead-code.test.ts`, 9 lines;
    card PRF-217)
    - **Module / layer:** profile-catalogue-data, tests (lean: delete).
    - **Problem:** it checks that three removed exports are still absent. It tests no behaviour.
    - **Fix:** delete the file.
    - **If we skip it:** 9 lines that guard nothing.

## Checked, no finding (probes run)

- **profiles (helper C).**
  - The temp file sits in the target's folder (no cross-device rename), is written with `wx` and `flush`, and temp and
    lock are removed on failure. Ids are encoded with `encodeURIComponent`, so no path traversal; long ids get a hashed
    name under 255 bytes. A case alias on macOS is a conflict, an unchanged entity is not rewritten, files over 16 MB
    are refused, and `__proto__` and `constructor` ids round-trip.
  - Store: the user layer wins whatever the order, duplicates are reported, caps hold, keys are in Maps.
  - Import: a file-count cap, a throwing `canHandle` claims nothing, a failing importer becomes a diagnostic, `native`
    is null-prototype.
  - Installed folders: links are never followed; depth, entry, file and byte caps; sorted, so runs are the same.
  - Worker: budget and heartbeat checked, settles once, terminated on budget, cancel or error, heap capped.
  - Watcher: debounce and max wait work, a change during a reload reruns it, dispose stops timers and watchers.
  - Layers: no `node:` or adapter import in `application` or `domain`, no `vscode` import.
- **profiles-orca, profiles-cura (helper B).**
  - Bundle archives refuse absolute paths, drive letters, `\`, NUL, `..`, and names ending in a dot or space; the
    writer refuses case and Unicode aliases and entries over the caps.
  - Orca instances (PRF-90): host types match `OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:197-215`; address and
    credential are capped; the parent chain is capped at 16 with loops caught; the credential is returned beside the
    entity, never in it.
  - `.curaprofile`: the writer matches `Cura@5bea2f8:plugins/CuraProfileWriter/CuraProfileWriter.py:25-31`; the reader
    caps entries, sizes and ratio and refuses ZIP64, encryption, symlinks, overlaps, CRC errors and duplicates.
  - Resource download (PRF-130): a full 40-hex commit over HTTPS, a stall timeout, every size and count capped, only
    plain files under the four resource folders, built in a temp folder and renamed into place.
- **3mf (helper A).** saxes builds attribute objects without a prototype, so `__proto__` keys stay data. On the real
  fixtures every named thumbnail exists, every instance gets its plate, and cuts and custom G-code read. A
  `plate_1.json` nested 5,000,000 deep does not crash. The round-trip test fails on a flipped byte, a recompress and a
  replace that touches another part. The 500 MB test gates CPU per turn and RSS, not wall time.
- **gcode-preview (me).** `parseFileCheck` refuses unknown fields, a bad size and a bad MD5, and hashing is capped at
  256 MB. The watchdog is cancelled on every stop, and a stopped follow stays quiet. Follow state is a pure reducer in
  `domain`, tested.
- **webview-kit (me).** `stateSteps` checks the record stride, the order and the move range, and its table has at most
  `moveCount + 1` rows; the tool index is bounded to 0..255. Fan and temperature read from one step texture with the
  layer table, through the same binary search.
- **Architecture.** No `vscode` import outside `presentation/` in the changed modules. No relative import into another
  module.

## Not checked

- The VS Code integration suites (gcode-preview), the Playwright webview tests (webview-kit, gcode-preview) and the mesh
  Chromium bench. GCP-124's fix is checked by reading only.
- The 500 MB bench itself (`3mf/test/large/run.ts`) and `generate.ts` in depth; the 3mf Web Worker in a real webview.
- Real Bambu or Orca projects with slice info, layer ranges or height profiles; real Orca and Bambu bundles from the
  field (owner questions Q30 and Q31 defaulted, SP13 cards PRF-218 and PRF-224); `fetch.ts` against GitHub.
- Windows: rename over an open file, reserved names (`CON.json`), file names from `encodeURIComponent`.
- Linux recursive `fs.watch` on a large tree (inotify limits); memory when `workerData` copies every file's bytes.
- The profiles-extension spikes (`docs/multi-root.md`, `docs/widget-spike.md`): docs only, not read.
- Mutation runs of the new tests.

Verdict: fix finding 1 first (a save can overwrite another profile file), then findings 2 to 4. All SP11 fixes hold.

Lean: -9 lines possible (finding 12), -0 dependencies.

## Findings

| # | Title | Severity | Board | Model |
|---|---|---|---|---|
| 1 | Save to the file the store shows when two user files share an id | must fix (P0) | profiles | sonnet |
| 2 | Re-index when a profile folder is moved or deleted | should fix (P1) | profiles | sonnet |
| 3 | Cap 3MF layer-data notices while reading, not after | should fix (P1) | viewer | sonnet |
| 4 | Drop printer host and credential keys when importing Orca and Bambu bundles | should fix (P1) | profiles | sonnet |
| 5 | Make the 3mf resolveProject heap assert independent of GC timing | should fix (P1) | viewer | sonnet |
| 6 | Add FileCheck to the gcode-preview API gate's caller-built types | nice to have (P2) | gcode | sonnet |
| 7 | Break a stale file-store lock without letting two writers in | nice to have (P2) | profiles | opus |
| 8 | Warn when a Bambu bundle entry's name differs from its file name | nice to have (P2) | profiles | sonnet |
| 9 | Merge 3MF custom G-code blocks of one plate and skip bad plate ids | nice to have (P2) | viewer | sonnet |
| 10 | Show a follow's reveal warning once per follow | nice to have (P2) | gcode | sonnet |
| 11 | Pass file paths, not URL paths, in the 3mf real-file tests | nice to have (P2) | viewer | sonnet |
| 12 | Delete profile-catalogue-data's dead-code guard test | nice to have (P2) | profiles | sonnet |

## Cards

Created by sp12-coordinator in SP13 (`type: bug`, `docs: .ai/audits/SP12-audit.md`):

| # | Card | Priority | Model |
|---|---|---|---|
| 1 | PRF-227 | P0 | sonnet |
| 2 | PRF-228 | P1 | sonnet |
| 3 | VWR-407 | P1 | sonnet |
| 4 | PRF-229 | P1 | sonnet |
| 5 | VWR-408 | P1 | sonnet |
| 6 | GCP-127 | P2 | sonnet |
| 7 | PRF-230 | P2 | opus |
| 8 | PRF-231 | P2 | sonnet |
| 9 | VWR-409 | P2 | sonnet |
| 10 | GCP-128 | P2 | sonnet |
| 11 | VWR-410 | P2 | sonnet |
| 12 | PRF-232 | P2 | sonnet |
