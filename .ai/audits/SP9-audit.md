# SP9 audit

Date: 2026-10-26. Range: `git diff c65f5a57..HEAD -- vsslicer/`. That is 18,140 files, but 18,009 of them are the
untracked profiles-data-orca data (PRF-190, Q21), which this audit skips. What is left is about 3,300 lines of new
source and about 31,000 lines of tests and fixtures. Most of the fixture lines are two klipper-estimator G-code
inputs.
Auditor: `sp9-auditor`, a fresh Opus agent that wrote none of SP9's code (card VSS-48). Read-only: I changed no code,
no cards and no git state, except this report and VSS-48's Progress.
Scope:
- First, the two items SP8 skipped: the catalogue tools (`profile-api/tools/catalogue/prusa.ts`, `cura.ts`,
  `groups.ts`), and the 3mf suite run with `.reference` really absent.
- Then the sprint's security-sensitive new code: slicer-runtime `extract-archive` (SLC-13), profiles-cura
  `.curaprofile` (PRF-131), profiles-prusa YAML (PRF-33, PRF-191), profiles-data-orca `generate.mjs` (PRF-190), mesh
  worker-web (VWR-49), gcode-preview follow and commands (GCP-50), and tooling licence, lint, package and notices
  (PLT-195 to PLT-197).
- Then the SP8 bug fixes, and the "tests never assert wall time" rule across all modules.

Method: `/ponytail:ponytail-audit`, about 25 minutes, mostly probes.
- Four forked helpers each took one area: the catalogue tools, the archive readers, the Prusa YAML and INI readers,
  and mesh with gcode-preview, tooling and data-orca.
- Every hostile file was built in a `mktemp -d` directory. Every probe loaded a module's `src/` by absolute path under
  Node 26.12, and the directories were deleted afterwards.
- `.reference` was only read, with one exception: the 3mf run below moved it out and back.
- No `pnpm install`, no `run.mjs`, and the registry was not touched.
- Times are noisy, because a `run.mjs ci` ran in the background during the first half of the audit. Results are
  reported as counts and ratios.

Load assumed: one person on a desktop, opening files they downloaded. That covers 3MF, `.curaprofile`, Prusa INI and
YAML, Orca bundles, G-code and engine archives. Engine archives come from a manifest that carries a sha256.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. In SP9:
- The runtime learned to unpack engine archives.
- The profile modules gained Cura `.curaprofile` and PrusaSlicer 3.0 YAML readers.
- The G-code preview can follow a running print.
- The mesh parser runs in web workers.
- The licence and notices tooling now handles the AGPL data packages.

## Earlier audit (SP8-audit.md): the fixes hold

All ten SP8 findings were fixed, and each fix holds when probed or read.

1. **3mf depth cap (VWR-394).**
   - `startTags` and `scanModel` now count depth and stop past 64 (`3mf/src/adapters/opc/xml.ts`, `modelScan.ts`).
   - Probe: nesting 40,000 and 100,000 deep was refused with `MalformedXmlError` in 0.3 to 1.2 ms. SP8 measured
     17.2 s at 40,000.
   - `test/xmlDepth.test.ts` counts opentag events (at most 65). It does not time anything.
2. **INI entry cap (PRF-185).** `MAX_ENTRIES = 500_000` stops the parse with one diagnostic.
   - At 4 MiB: 500,000 entries and +37 MB of heap.
   - At 63 MiB: 500,000 entries and +107 MB, of which 66 MB is the input string. SP8 measured 1,234 MB.
   - Both runs gave 1,002 diagnostics, with the cap message last.
3. **`runProcess` kill tests (SLC-277).** They now use `/bin/sh` with the trap set before `echo up`. They assert that
   the ready line exists and that the pid is an integer. Read; I did not run them under load.
4. **Wall-time asserts (VWR-395, GCP-115, PRF-186).** A grep finds none left in 3mf, gcode-bgcode, gcode-parser or
   profile-api. The SP8 grep missed two other modules, though: see finding 4.
5. **profile-api PROVENANCE (PRF-187).** `PROVENANCE.md` is now in `files`.
6. **printer-folder long names (PRN-443).** `cutInput` keeps a last `.ext` of up to 64 characters.
   - A 2,006-character name ending in `.gcode` keeps its extension: it becomes 255 characters ending in `xxxx.gcode`
     with long names, and `XXXXXX.GCO` on FAT.
   - A 70-character extension is cut, as designed.
7. **Slicer timeout (SLC-278).** The schema has `maximum: 2147483`, and the reader rounds and clamps the value with a
   warning:
   - 3,000,000 becomes 2,147,483. 1.0005 and 0.4 become 1.
   - -1, NaN and `'5'` fall back to 600.
   - Each bad value adds exactly one warning.
8. **Notices for `@vsslicer` packages (PLT-195).** `third-party-notices.mjs` now copies NOTICE, NOTICE.md and
   PROVENANCE.md, each capped at 1 MiB and quoted safely. Read by a helper.
9. **Exporter path check (PRF-188).** The contract now refuses backslashes and anything `unsafePath` refuses. This is
   the same function the bundle reader uses, now exported.
10. **Dead `host` check (PRF-189).** It is deleted. A symlink mode is still refused with host byte 0 and with host
    byte 3 (two probes).

## Must fix

None.

## Should fix

1. **Real Cura profile exports are refused when the profile name has a colon or ends in a dot or space**
   (`profiles-cura/src/adapters/archive/curaprofile-archive.ts:L76-L85`, used at `L165` and `L254`)
   - **Module / layer:** profiles-cura, adapters (archive).
   - **What this is:** `unsafeEntryName` checks every entry name in a `.curaprofile` zip. It applies path rules and
     Windows NTFS rules: no `:` anywhere, and no segment that ends in `.` or a space.
   - **Problem:** Cura names each zip entry after the profile id, and the id comes from the name the user typed:
     - The id is `(base_id + "_" + new_name).lower().replace(" ", "_")`, plus a ` #2` suffix when the name is taken
       (`Cura@5bea2f8:cura/Machines/Models/QualityManagementModel.py:L256-L258`,
       `Uranium@e65ccc1:UM/Settings/ContainerRegistry.py:L739-L743`, `CuraProfileWriter.py:L25-L31`).
     - So a profile named "Draft: PLA" or "v1." gives an entry name with `:` or a trailing `.`.
     - This reader keeps entries in memory and never writes them to disk, so the NTFS rules protect nothing here. They
       only reject valid files.
   - **How verified:**
     - `writeCuraProfileArchive([{id:'um3:custom'}])` is refused: "colon in name (NTFS alternate stream)".
     - `{id:'abc '}` is refused: 'segment ends in "." or space'.
     - The reader runs the same check, so a whole archive with one such entry fails.
     - `my profile_1` round-trips.
   - **Fix:** for these in-memory ids, keep only the checks for empty, NUL, backslash, absolute paths and `.`/`..`.
     Drop the colon and trailing-dot/space rules; a caller that later writes ids to disk sanitises them there. Add one
     test with the id `ultimaker_s5_draft:_pla.`.
   - **If we skip it:** users cannot import their own Cura profiles when the name has a colon or a trailing dot, and
     the error calls the file unsafe.

2. **Following a print that opens a new preview starts on move 0, not on the printer's position**
   (`gcode-preview/src/application/preview-session.ts` `reveal` L188-L194; `presentation/webview/main.ts` L77-L82,
   L392, L473-L476)
   - **Module / layer:** gcode-preview, application and presentation (webview).
   - **What this is:** `reveal` waits for the host state, then posts a `seek` to every channel the preview serves.
     Meanwhile `deliver` sends the move buffers one at a time.
   - **Problem:**
     - The first follow push opens the preview and reveals right away, so the `seek` can reach the webview before any
       move buffer.
     - At that point `info.moves` is still an empty `ArrayBuffer`, so `timeOfMove` returns 0.
     - When the data arrives, `createClock(s.totalTime)` resets the clock anyway.
     - The preview shows move 0 until the next push, and a paused print never sends one.
   - **How verified:** by reading only; I did not reproduce it in a real webview.
     - `served.add` runs when the preview is served (L140), and nothing makes `reveal` wait for the buffers to be sent.
     - The only reveal test (`test/follow.test.ts:L189-L198`) checks that a seek is posted. It does not check what
       happens when the seek arrives before the data.
   - **Fix:** either of these works.
     - The session remembers the last revealed position, and `deliver` posts it again after the last move buffer.
     - Or the webview keeps a pending seek while `info.moves.byteLength === 0` and applies it after mount.
     - Add one test: reveal before delivery finishes, and expect a seek after the buffers.
   - **If we skip it:** "follow print" from the printer panel opens at the wrong spot, and stays there for a paused or
     finished print.

3. **The Prusa YAML preset and vendor readers do not cap their own diagnostics** (`profiles-prusa/src/adapters/yaml/preset.ts`
   `warn` in `readPresetStream`; `vendor.ts` `warn` in `readVendorYaml`)
   - **Module / layer:** profiles-prusa, adapters (yaml).
   - **What this is:** `parseYaml` stops at 1,001 diagnostics (`MAX_YAML_DIAGNOSTICS`). The two readers copy those in,
     then add their own warnings with no limit.
   - **Problem:**
     - Each bad record adds one diagnostic. The only bound is the parser's cap of 1,000,000 nodes.
     - In the preset reader, "variant is not a map; skipped" also gets past the 10,000-variant cap, because only map
       variants are counted.
   - **How verified:**
     - Preset file `kind: print / id: x / variants:` followed by N lines of `- a`:
       - N = 200k (0.8 MB): 200,000 diagnostics, heap +35 MB.
       - N = 900k (3.6 MB): 900,000 diagnostics, heap +196 MB, of which the diagnostics hold 75 MB (about 83 B each).
     - Vendor file of N repeats of `---\na: 1\n`:
       - N = 200k (1.8 MB): 200,000 diagnostics, heap +105 MB.
       - N = 900k (8.1 MB): 500,001 diagnostics, then the node cap stopped it, heap +264 MB.
     - Growth is linear.
   - **Fix:** send both readers' `warn` calls through one capped push, like `parseYaml`'s `diag`. Stop at
     `MAX_YAML_DIAGNOSTICS`, with one "further diagnostics suppressed" at the end. Add a test that counts the
     diagnostics for 10,000 non-map variants.
   - **If we skip it:** one hostile preset or vendor file under the 8 MiB input cap adds 100 to 260 MB to the extension
     host's heap. Today only callers that pass `experimental: true` can reach these readers.

4. **Two older tests still assert wall time** (`gcode-planner/test/planner.test.ts:L116-L118`,
   `mesh/test/parse-model.test.ts:L54-L56`)
   - **Module / layer:** tests in gcode-planner and mesh. Both predate SP8 (commits `a9eddb49` and `8e279115`), and
     the SP8 grep missed them.
   - **What this is / Problem:** both use `expect(performance.now() - t).toBeLessThan(2000)`.
     - The planner test guards against the per-move marker scan (20,000 G4 markers).
     - The mesh test guards against an endless OBJ line fed in 200 chunks of 64 KiB.
     - Both fail when the machine is slow, not when the code is wrong.
   - **How verified:** `grep -rnE 'performance\.now|Date\.now|hrtime'` over every module's `test/`. These are the only
     two time asserts left:
     - `webview-kit/test/integration/transfer.test.ts:L23-L27` only logs its times.
     - `webview-kit/test/integration/harness.ts:L69` is a wait-until with a fail-on-timeout guard.
     - A second grep over SP9's own tests (`setTimeout`, `sleep`, `toBeLessThan`) found no timer races:
       `follow.test.ts` uses `setTimeout(0/10)` only to drain microtasks, because the code under test has no timers.
   - **Fix:** count the work instead.
     - Planner: count marker visits through a spy, and expect a linear count in the number of markers.
     - Mesh: count chunks consumed before the throw, which should be 32 or fewer for a 1 MiB line cap.
     - Or drop the bound and keep the test timeout as the hang guard. One card each: GCP (gcode-planner) and VWR
       (mesh).
   - **If we skip it:** both tests flake under parallel `run.mjs ci`.

## Nice to have

5. **Any package can claim AGPL-3.0-only by adding an empty PROVENANCE.md** (`tooling/bin/check-licence.mjs:L49-L53`)
   - **Module / layer:** tooling.
   - **What this is:** PLT-197 lets a package use `AGPL-3.0-only` when its `files` list has `PROVENANCE.md` and that
     file exists.
   - **Problem:** nothing checks that the file has content, or that the package holds data and not code. The exemption
     was meant only for the Q20/Q21 data packages.
   - **How verified:** a fixture passed (`check()` returned `[]`) with these parts:
     - `"license":"AGPL-3.0-only"`, and `files` listing `PROVENANCE.md`.
     - An empty PROVENANCE.md.
     - A real `src/x.ts` with an `-only` SPDX header.
     A second fixture with `MIT OR AGPL-3.0-or-later` was correctly refused.
   - **Fix:** require a non-empty PROVENANCE.md, and either list the allowed `-only` packages by name or refuse `-only`
     for a package with `src/` code.
   - **If we skip it:** a code module can switch to AGPL-3.0-only and still pass CI. Preventing that is the reason the
     check exists.

6. **`parseUrl` downloads every file before the queue limit is checked** (`mesh/src/adapters/worker-web/pool.ts:L141-L144`,
   `fetch-bytes.ts:L18-L35`)
   - **Module / layer:** mesh, adapters (worker-web).
   - **What this is:** `parseUrl` first calls `fetchBytes(url, cap)` and only then calls `pool.parse`, which is where
     `maxQueued` is checked.
   - **Problem:**
     - Nothing limits how many fetches run at once, and each one can hold up to 1 GiB (`DEFAULT_MAX_FILE_BYTES`).
     - `fetchBytes` keeps every chunk and then copies them into one buffer, so each file briefly costs twice its size.
   - **How verified:** a fake `fetch` served 8 MiB bodies to a pool of size 1 with `maxQueued` 2, and 100 parallel
     `parseUrl` calls were made.
     - All 100 bodies (800 MiB) were read before the first refusal.
     - Then 97 calls were refused with `PoolQueueFullError`.
     - A grep finds no production caller yet: only tests, the browser test entry, and the index export.
   - **Fix:** count fetches in flight and refuse past `maxInFlight + maxQueued` before fetching. When `Content-Length`
     is known, allocate the buffer once.
   - **If we skip it:** once the viewer opens a 3MF with many parts through `parseUrl`, the webview can grow to several
     GiB and crash.

7. **`extractArchive` reports a name collision as a raw `Error`, or labels it "gzip:"**
   (`slicer-runtime/src/adapters/extract-archive.ts:L195`, `L560`)
   - **Module / layer:** slicer-runtime, adapters.
   - **Problem:** two entries whose names differ only in Unicode normalisation (`é` in NFC and in NFD) both reach
     `open(path, 'wx')`, and the second one fails with EEXIST.
     - In a zip, this comes out as a plain `Error` with code EEXIST.
     - In a tar.gz, it comes out as `ArchiveError("gzip: EEXIST …")`.
     - Either way the extraction is refused and staging is removed, so this is safe. But callers that branch on
       `ArchiveError` get the wrong kind of error.
   - **How verified:** zip probe: constructor `Error`, code EEXIST, and `out/` left empty. The tar probe gave the
     "gzip:" message.
   - **Fix:** in `Output.file` and `mkdirs`, map EEXIST to an `ArchiveError` that names the collision. Use the "gzip:"
     prefix only for errors that gunzip raised.
   - **If we skip it:** a confusing message for an odd archive. There is no safety impact.

8. **For tar.gz, the 1000:1 ratio cap almost never fires, so the real bound is 4 GiB on disk**
   (`extract-archive.ts:L32-L39`, `L499`)
   - **Module / layer:** slicer-runtime, adapters.
   - **Problem:** deflate itself cannot do much better than about 1032:1, so the cap sits right at that ceiling.
     - The ratio is measured against `bytesRead` of the read stream, which runs ahead of gunzip. A small bomb is
       therefore caught only near its end.
     - A stream at 900:1 is never caught by the ratio. It stops only at 1 GiB per file or 4 GiB in total.
   - **How verified:** a 260,982-byte gzip of 256 MiB of zeros was refused for its ratio after 2.9 s, with almost all
     256 MiB already written to staging, which was then removed.
   - **Fix:** none needed today: nothing calls `extractArchive` yet, and engine archives carry a sha256
     (`slicer-api/src/domain/engine-install.ts:L29`). When the caller is wired up, verify the sha256 before
     extracting, or lower `maxRatio` to about 200 and `maxTotalBytes` to the engine's real size.
   - **If we skip it:** an unverified archive could fill up to 4 GiB of disk before it is refused.

9. **The YAML parser does not count documents against its node cap** (`profiles-prusa/src/adapters/yaml/parse.ts`,
   stream loop L545-L590, `class Fail extends Error` at L99)
   - **Module / layer:** profiles-prusa, adapters (yaml).
   - **Problem:**
     - Each `---` adds a document, but only nodes count toward `MAX_YAML_NODES`.
     - Each failed document throws a `Fail`, which is an `Error` and captures a stack trace.
   - **How verified:**
     - 2,000,000 repeats of `---\n` (8 MB): 2M documents, heap +132 MB, 197 ms.
     - Repeats of `---\n@\n`, which fail to parse: 300k (1.8 MB) took 677 ms, and 1.3M (7.8 MB) took 3.3 s and
       +83 MB. That is linear, but 3.3 s of CPU for under 8 MB.
     - Diagnostics stayed capped at 1,001.
   - **Fix:** call `node()` once per document. Optionally make `Fail` a plain object.
   - **If we skip it:** an 8 MB file costs about 3 s of CPU or 130 MB of heap. That is bounded, but large for the file
     size.

10. **`generate.mjs` can leave `data/` half written** (`profiles-data-orca/scripts/generate.mjs:L72-L73`)
    - **Module / layer:** profiles-data-orca, publish-time script.
    - **Problem:** the comment says "verify, then swap", but the swap deletes `data/` and then copies the staged
      folder in. If the copy fails partway (for example a full disk), `data/` is left partial, and `finally` deletes
      the staged copy.
    - **How verified:** by reading; I did not fill a disk. The next run regenerates the data and checks the tree hash,
      so nothing bad gets published.
    - **Fix:** after the delete, use `renameSync(tmp, out)` instead of the copy. Both folders sit in the same
      directory, so the rename cannot cross drives. One line, and it removes the second full copy.
    - **If we skip it:** an interrupted `prepack` leaves a partial `data/` on the publishing machine, until the next
      run.

11. **`readBounded` in the Cura catalogue tool is used only by tests** (`profile-api/tools/catalogue/cura.ts:L43-L48`,
    `L562-L566`)
    - **Module / layer:** profile-api, tools (the catalogue generator, which runs at build time).
    - **Problem:**
      - `generate.ts` `outputs()` reads Cura through `readSource`, which refuses symlinks and paths that leave the
        checkout, and checks the pinned commit. `readBounded` does neither.
      - Its only callers are in `test/catalogue-cura.test.ts:L13-L23,L129-L138,L205-L241`. At L207 that test reads
        Cura with `readFileSync` and never checks the pinned commit.
    - **How verified:**
      - A grep over `tools/`, `test/` and `src/` finds no other caller.
      - A symlink `root/link.json` pointing outside the root was read by `readBounded`, and refused by `readSource`.
    - **Fix:** delete `readBounded` and the two path constants. Have the test call `outputs()`, as
      `catalogue-groups.test.ts` does. About 6 lines go.
    - **If we skip it:** a second, weaker way to read upstream files stays in the code. It has no production effect.

No smaller items were left out.

## Checked, no finding (probes run)

- **Catalogue tools: `prusa.ts`, `cura.ts`, `groups.ts`** (item 1, which SP8 skipped).
  - **Regeneration matches the committed data byte for byte.** `outputs()` ran on the pinned checkouts (Cura 5bea2f8,
    fdm_materials 0c05969, PrusaSlicer 30ef591, PrusaSlicer-2.9 b028299, SuperSlicer 1f3d287) in 427 ms. The 6 files
    were identical: `orca.json` 689,440 B, `bambu.json` 70,971, `prusa.json` 90,063, `superslicer.json` 239,391,
    `cura.json` 465,246, `groups.json` 36,958.
  - **Hostile inputs scale linearly: there is no quadratic path.** Times in ms at 1e5, 4e5 and 1.6e6 characters:
    - `keyLines` on unterminated strings: 1, 2, 8.
    - `keyLines` on many `"a":{`: 1, 3, 15.
    - `pythonMap` with no closing brace: 2, 8, 59.
    - `uiSettings`: 8, 10, 33.
    - `vendorFeatures`: 3, 7, 32.
    - `bodyOf` with n/5 unclosed `X::f(`: 4, 10, 47. The cached bracket table at `cpp.ts:L187-L209` keeps it linear.
    - `tabPlaces`: 2, 4, 13.
    - Inputs are capped at 16 MiB by `readSource`, and Cura nesting at 32.
  - **Correctness against upstream.**
    - `pythonMap` on `XmlMaterialProfile.py`: 24 of 24 settings pairs, 1 of 1 properties, 3 of 3 metadata.
    - `keyLines`: fdmprinter has 740 settings and fdmextruder 31. No key opens an object twice, so taking the first
      match is right.
    - `settable_per_*` defaults to true (`Cura@5bea2f8:cura/CuraApplication.py:413-416`).
    - The 9 Cura hidden keys are all `command_line_settings`.
    - The "138 Cura names" note holds: 136 names plus 2 splits.
  - **Prusa and SuperSlicer key sets.** No key contains `-`, and none is an `Object.prototype` name. None of the 35
    `prusa.hw_*` keys collides with a definition key.
  - **SuperSlicer `.ui` files.** The last part is always the key; only the 4 `milling_*` lines are unknown.
  - **`vendor.yaml` features.** Indents are 2, 4 and 6 only. There are 4 namespaces and 26 features.
  - **`ValueMapBuilder.cpp`.** 7 calls give 9 features, with the duplicate removed.
  - **3.0 legacy placement.** No legacy-only entries exist in `prusa.json` (0 of 122), so `lPlace` cannot change the
    output.
- **3mf with `.reference` absent** (item 2, which SP8 skipped).
  - No `run.mjs ci` was running (`pgrep` empty). I moved `.reference` to a `mktemp -d` directory, with a trap to move
    it back, ran `cd vsslicer/modules/3mf && pnpm test`, and moved it back. `ls` confirmed it was back with
    `repos/`, `notes/`, `downloads/` and `dl-13/`.
  - Result: 11 files passed, 153 tests passed and 3 were skipped (156 in total).
  - With `.reference` present: 162 passed. So 3 tests skip, and 6 `test.each` cases filter out. Nothing fails.
- **slicer-runtime `extractArchive` (SLC-13).**
  - **tar.gz: refused as `ArchiveError`, with no `.partial-` directory left behind:**
    - Paths: `../x`, `/etc/x`, `a/../../x`, a backslash, `C:x`.
    - Hardlink and fifo entries.
    - Symlinks `s -> ..` and `s -> /etc`, and a file through a symlinked directory.
    - Realpath escapes: `y -> .` plus `x -> y/..`, and `y -> a/b` plus `x -> y/../../..` (both caught in `finish()`).
    - A symlink loop.
    - The duplicate pair `a` and `./a`.
    - pax `path=../../evil`, a GNU `L` longname `../gnu`, and a 20 KB `L` header.
    - A size field `77777777777` (over 1 GiB), and a size with no data behind it.
    - Empty input, garbage, and gzip magic followed by garbage.
    - Accepted, correctly: a valid link `l -> d/f`, and mode 4777, which is written as 755.
  - **zip:**
    - Refused: traversal, absolute paths, symlinks to `..` and `/etc`, a file through a symlink, fifo mode, and
      overlapping entries.
    - 200 MiB of zeros in a 205 KB file: refused at 1000:1 in 140 ms, RSS +87 MB.
    - A central directory claiming 1 B for 10 MiB: refused, RSS +47 MB.
    - Mode 104777 is written as 755.
  - **Scaling:** 1k, 4k and 16k entries took 2.3, 6.1 and 7.3 s flat, and 0.19, 1.2 and 7.2 s in one deep directory.
    Linear within the noise of the background CI.
  - **Read:**
    - zip64 and multi-disk archives are refused, and `start + csize > cdOff` is bounded.
    - The symlink payload limit is 8 KB.
    - The tar header cap is 2 × `maxEntries`.
    - Octal fields are capped at 12 digits, base-256 is refused, and the checksum accepts the signed and unsigned
      forms.
    - Symlinks are created only after every file is written.
  - New dependency `fflate` 0.8.3 (MIT), the same version 3mf already uses.
- **profiles-cura `.curaprofile` (PRF-131).**
  - **Refused:**
    - Empty, 5-byte and 1 MiB garbage input.
    - `../x`, `a/../b`, `/abs`, `C:x`, NUL, the case duplicate `Q`/`q`, and symlinks.
    - 16 MiB of zeros, at 100:1, in 171 ms.
    - 1,001 entries (1,000 are read in 40 ms), and 5 × 16 MiB, by the 64 MiB total.
    - A declared size of 100 B for 1 MiB, overlapping data, and trailing junk after the end record.
  - **Accepted:** a zip comment.
  - **Memory:** a declared size is allocated only after the per-entry, total and ratio checks.
  - **Cura parity:** the case-folded duplicate check matches Cura's `uniqueName(ignore_case=True)`.
- **profiles-prusa YAML (PRF-33, PRF-191).**
  - **Nesting:** indentation 100 and 3,000 levels deep, `[` 1e3 and 1e6 deep, and `- - -` 1,000 deep are all refused
    at 64. Steps grow linearly: 4.5M steps for 4.5 MB.
  - **No expansion:** anchors, aliases, tags, merge keys and `?` keys are refused by name, so a billion-laughs file
    cannot expand.
  - **Width:**
    - A flow list of 500k items: 39 MB in 38 ms. 3M items stop at the node cap in 108 ms.
    - 600k distinct keys: 159 MB in 359 ms.
    - 1.5M duplicate keys: 1,001 diagnostics.
  - **Long values:**
    - A 1M-character plain value is read. A 2M-character one is refused.
    - 3M `:a` pairs: linear (4M steps at 1M, 12M at 3M).
    - 1M `\n` escapes: 71 ms. A 300k-line block scalar: 34 ms. 8M newlines: 356 ms.
  - **Tabs:** a tab in the indentation is refused.
  - **Prototype pollution:** maps are entry arrays, so `__proto__` and `constructor` keys stay plain data.
    `Object.hasOwn` guards the `kind` lookup.
  - **Against upstream:** 434 PrusaSlicer@30ef591 `.yaml` files (2.9 MB).
    - `resources/` parses cleanly: 812 documents, 528 presets and 279 vendor records.
    - The only failures are 2 documents in upstream test data, at
      `src/slic3r-shared/test/data/presets/preset-filament-common.yaml:4` and `:40`. Both use a single-quoted value
      wrapped over several lines, which the reader refuses by design. The golden-count test (`yaml-preset.test.ts:168`)
      would catch upstream starting to do this.
  - **`tags.ts`:** `PRINTER_VENDOR_PRUSA3D` is now an ordinary tag. The test and the fixture changed with it.
- **mesh worker-web (VWR-49).**
  - Every job ends through `end()`, which removes its handlers and abort listener.
  - A failed worker is terminated, never reused. `dispose` terminates idle and running workers and rejects the queue,
    and a late message after dispose is ignored.
  - A throwing `postMessage` rejects the job.
  - The caller's buffer is detached after `parse()` (byteLength 0), and a view that does not own its whole buffer is
    copied first.
  - The queue limit is exact: 97 of 100 calls refused.
  - `fetchBytes` streams under the cap when `Content-Length` is missing or lies.
  - Layers: worker-web imports only `application`, `domain` and sibling adapters.
- **gcode-preview follow (GCP-50).**
  - **`parsePosition` refuses:** NaN, `fileOffset` 2^32, a string z, `{}`, and unknown keys. -0 is accepted as layer 0.
  - **`resolvePosition`:** across 2 buffers with offsets [0, 10 | 20, 30, 40], offsets 0, 9, 10, 25, 40 and 1e9 give
    moves 0, 0, 1, 2, 4 and 4. With 1 move, the result is always 0. No moves throws a RangeError.
  - **The follower:** one pending position, and the newest wins. A throwing `onError` is swallowed.
  - **`commands.ts`:** every argument is validated before the first await (URI up to 8,192 characters, plate 1..1000,
    unknown keys refused). Followers are removed on `stopFollow`, when the preview closes, and on dispose.
- **tooling (PLT-195 to PLT-197).**
  - `eslint.mjs` takes the licence from the nearest package.json (at most 1 MiB, cached), and falls back to or-later,
    matching `check-licence`.
  - `vsslicer-package.mjs` checks the name against vsce's rule before running vsce, so `/` and `.` cannot reach a path.
  - Notices sections are sorted, so the output is deterministic.
- **profiles-data-orca `generate.mjs` / `tree.mjs` (PRF-190).**
  - Symlinks are refused at any depth, and so is a profiles root that escapes the clone.
  - Size and count limits are checked across both trees before copying. A target outside `data/` is refused.
  - The tree hash is checked after the copy.
  - Without the pinned clones, `git rev-parse` (run without a shell) throws, so `prepack` cannot publish, and
    `data.test.ts` skips. There are 10 generate tests.
- **Architecture.**
  - No `vscode` import outside `presentation/` in any module's `src`.
  - No relative import reaches another module (grep for `../../../` and `modules/`).

## Not checked

- **Catalogue judgement tables** (`TAB_GROUPS`, `UI_GROUPS`, `EPIC_TABLE`, `ORCA_DELTAS`) against the feature matrix,
  and the hand-made rename tables pair by pair. They agree with each other (`groupReport` throws otherwise), and the
  regeneration matches.
- **Finding 2 in a real VS Code webview.** It is found by reading only.
  - `blobWorkerSpawner` with a real browser Worker: the mesh browser test needs Playwright.
  - GCP-50's `package.json` contributes and activation entries.
- **`extractArchive` on case-insensitive volumes and Windows.** The probe volume is case-sensitive, and junctions,
  8.3 names and `CON` were not tried. Also not checked: the rename race on `dest` (L67, L90), and real engine release
  archives (none downloaded).
- **`third-party-notices` on a real esbuild metafile.** If profiles-data-orca's JSON is read at runtime instead of
  bundled, its NOTICE will not be copied. No extension depends on it yet.
- **The `runProcess` kill tests under real CI load**, and the SP8 test fixes beyond reading them.
- **The full suites of other modules.** Only 3mf was run. I ran no `pnpm pack`.
- **The YAML `condition` text** (left raw for a later card), and ryml quirks beyond the 434 pinned files.

## Cards

Created by the SP9 coordinator in SP10 (`sprint: VSS:SP10`), linked to this report.

| Finding | Severity | Board | Model | Card |
|---|---|---|---|---|
| 1 Accept Cura profile names with a colon or a trailing dot or space in .curaprofile archives | should fix (P1) | profiles | sonnet | PRF-194 |
| 2 Apply a follow position that arrives before the preview has loaded its moves | should fix (P1) | gcode | opus | GCP-118 |
| 3 Cap the Prusa YAML preset and vendor readers' own diagnostics | should fix (P1) | profiles | sonnet | PRF-195 |
| 4a Replace the wall-time assert in gcode-planner planner.test.ts | should fix (P1) | gcode | sonnet | GCP-119 |
| 4b Replace the wall-time assert in mesh parse-model.test.ts | should fix (P1) | viewer | sonnet | VWR-396 |
| 5 Require a non-empty PROVENANCE.md and a data package for AGPL-3.0-only in check-licence | nice to have (P2) | platform | sonnet | PLT-198 |
| 6 Check the queue limit before downloading in the mesh worker pool parseUrl | nice to have (P2) | viewer | sonnet | VWR-397 |
| 7 Report archive name collisions as ArchiveError with the right format label | nice to have (P2) | slicer | sonnet | SLC-279 |
| 8 Bound tar.gz extraction by the archive size and require a sha256 check before extract | nice to have (P2) | slicer | sonnet | SLC-280 |
| 9 Count YAML documents against the parser node cap | nice to have (P2) | profiles | sonnet | PRF-196 |
| 10 Swap generated data into place by rename in profiles-data-orca generate.mjs | nice to have (P2) | profiles | sonnet | PRF-197 |
| 11 Delete the test-only readBounded from the Cura catalogue tool | nice to have (P2) | profiles | sonnet | PRF-198 |
