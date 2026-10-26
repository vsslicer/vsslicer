# SP8 audit

Date: 2026-10-26. Range: `git diff ec339162..HEAD -- vsslicer/` (348 files: about 2,000 lines of new source code; the
rest is tests, fixtures, lockfiles and 12 empty scaffolds).
Auditor: `sp8-auditor`, a fresh Opus agent that wrote none of SP8's code (card VSS-47). Read-only: no code, no cards and
no git state changed, except this report and VSS-47's Progress.
Scope: everything SP8 changed. That is profile-api 0.1.1 (PRF-180); profiles (locate, form model, search);
profiles-prusa (INI reader, conditions, tags); profiles-orca (compatible_printers, bundle archive reader and writer);
profiles-cura (quality conditions); slicer-api (engine errors, install manifest); slicer-runtime (`runProcess`);
slicer-extension (settings, tasks); printer-api (errors, auth, capabilities); printer-folder (names); agent-protocol
(error model); printers-extension; the scaffolds; and gcode-preview GCP-41. The owner also asked for three more things:
re-running hostile-input probes against every parser from SP6 to SP8, the areas SP7 skipped, and the architecture
rules.
Method: `/ponytail:ponytail-audit`, run for 35 minutes, and mostly probes this time. Each hostile file was built in a
scratch directory. Each probe script loaded a module's `src/` through its absolute path under Node 26. Each probe that
scales was run at two or three sizes, and is reported as a ratio or a count. One forked helper read the SP7-skipped
areas. `.reference` was only read. I put no test file in any module, ran no `pnpm install` and did not run `run.mjs`.
Load assumed: one person on a desktop, opening files they downloaded: 3MF, STL/OBJ, `.gcode.3mf`, G-code, profile
bundles, INI files and Cura/Orca configs. The slicing engine's output comes from a local child process.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. In SP8 the profile
modules began reading real Prusa INI, Orca bundles and Cura metadata into one shared condition language. The slicer
and printer contracts (`*-api`) gained errors, capabilities and an engine-install manifest. `runProcess` can now run a
slicing engine safely.

## Earlier audit (SP7-audit.md): the fixes hold

1. Manifest encoded only near the limit (PRF-180): the code is now
   `text.length > max || (text.length * 3 > max && new TextEncoder().encode(text).length > max)`
   (`profile-api/src/domain/bundle/bundle.ts:L108`), which matches its comment. I probed it: a 20 MB manifest is
   refused in 0.0 ms, and a 1 MB one is parsed in 4 ms. Held.

## Must fix

1. **A 741-byte 3MF keeps the CPU busy for 17 seconds before it is refused** (`3mf/src/adapters/opc/xml.ts:L13-L27`,
   `3mf/src/adapters/opc/modelScan.ts:L15-L34`)
   - **Module / layer:** 3mf, adapters (opc).
   - **What this is:** `startTags` reads `[Content_Types].xml` and every `.rels` part (`opc.ts:L33,L50`). `scanModel`
     makes the first pass over each model part during `openPackage`. Both use saxes with `xmlns: true`.
   - **Problem:** neither one limits how deep elements may nest. With `xmlns: true`, saxes does more work for each new
     level of depth, so the total cost grows with the square of the depth. `readModel` already refuses a model nested
     deeper than 64 (`readModel.ts:L39,L102-L103`), but these two readers run before it, or without it.
   - **How verified:** I built zip files with `<a>` nested to depth d in `[Content_Types].xml` and ran `readPackage`.
     d = 10k gave a 494-byte file and 484 ms. d = 20k gave 577 B and 2.4 s. d = 40k gave 741 B and 17.2 s. Doubling the
     depth costs 5 to 7 times as much. `startTags` alone took 127 ms at d = 5k, 512 ms at 10k, 2.9 s at 20k and 77.5 s at
     100k. `scanModel` took 490 ms at 10k and 2.1 s at 20k. The same text through saxes with `xmlns: false` takes 2 to
     3 ms, which shows the namespace handling is the slow part. The file stays tiny because the text compresses about
     1000:1, and the 1 GiB total cap does not help.
   - **Fix:** add the same depth counter `readModel` has to both readers: count up on `opentag`, down on `closetag`, and
     throw `MalformedXmlError` past 64. Add one test with depth 10,000 that checks the error, not the time.
   - **If we skip it:** a file under 1 KB freezes the 3MF reader for minutes. Opening a downloaded 3MF hangs the
     extension or its worker.

## Should fix

2. **A hostile 64 MiB Prusa INI takes 1.2 GB of memory** (`profiles-prusa/src/adapters/ini/parse.ts:L5,L9,L11,L175`)
   - **Module / layer:** profiles-prusa, adapters (ini).
   - **What this is:** `parseIni` accepts up to 64 MiB, 50,000 sections and 10,000 keys per section, and keeps one
     `{key, value, line}` object per line.
   - **Problem:** a line of only `a=` (3 bytes) becomes an object of about 56 bytes. 2,200 sections of 9,999 such lines
     fit under every cap. The largest real file is 1.5 MB (`PrusaResearch.ini`), so the 64 MiB cap leaves 42 times
     headroom, and all of that headroom can be turned into heap.
   - **How verified:** I generated files of `[print:sN]` followed by 9,999 lines of `a=`. 4 MiB gave 1.4 M entries and
     79 MB of heap. 16 MiB gave 5.6 M entries and 314 MB. 63 MiB gave 22 M entries and 1,234 MB. Memory grows in a
     straight line at 56 bytes per entry. Other hostile shapes stayed bounded: lines without `=`, one 32 MiB line, 1 M
     duplicate keys, and 2 M unclosed headers each finished in under 80 ms, with diagnostics capped at 1,001.
   - **Fix:** cap the total number of entries, for example `MAX_ENTRIES = 500_000` (the pinned bundle has about
     100,000), and stop with one diagnostic, the way `MAX_SECTIONS` does. Or lower `MAX_INI_BYTES` to 16 MiB. Add a test
     that counts entries, not time.
   - **If we skip it:** importing one hostile INI can push the extension host to 1 GB or more, and it may run out of
     memory.

3. **Two `runProcess` tests depend on how fast `node` starts** (`slicer-runtime/test/run-process.test.ts:L46-L63`)
   - **Module / layer:** slicer-runtime, tests.
   - **What this is:** the test "SIGTERM-ignoring child gets SIGKILL" uses `timeoutMs: 1000`. The test "grandchildren
     in the group are killed" uses `timeoutMs: 1500`.
   - **Problem:** each test passes only if the child `node` installs its SIGTERM handler, or prints its grandchild's
     pid, before the timer fires. On a busy CI machine `node` can take longer than a second to start. Then the child
     dies from SIGTERM: `signal` is `'SIGTERM'`, not `'SIGKILL'`, or `r.lines[0]` is undefined and the test throws a
     TypeError. This is a hidden wall-clock assertion, which the no-wall-time test rule forbids.
   - **How verified:** I read both tests. The timer starts at spawn time (`run-process.ts:L158`), and the child's
     handler is installed only once `node` has booted. I did not reproduce a failure under load.
   - **Fix:** use a child that starts in milliseconds and sets its traps first, for example
     `/bin/sh -c 'trap "" TERM; echo up; while :; do sleep 1; done'` and `sh -c 'sleep 1000 & echo $!; wait'`, and
     assert that `r.lines[0]` exists before reading the pid. Both tests are already skipped on Windows.
   - **If we skip it:** CI fails now and then on slicer-runtime under the parallel `run.mjs ci` load, and people learn
     to ignore red runs.

4. **Older tests still assert wall time** (3mf, gcode-bgcode, gcode-parser, profile-api)
   - **Module / layer:** tests in four modules. They predate SP8; the owner asked for a grep of all modules.
   - **What this is / Problem:** these tests fail when the machine is slow, not when the code is wrong:
     `expect(performance.now() - t).toBeLessThan(...)` or the same with `Date.now()`, or a throughput floor:
     - 3mf: `test/zip.test.ts:L80,L88` (100 ms), `test/readModel.test.ts:L150`, `test/resolveProject.test.ts:L224`.
     - gcode-bgcode: `test/read-bgcode.test.ts:L144`, `test/meatpack.test.ts:L128`, `test/heatshrink.test.ts:L138`,
       and `test/ascii.test.ts:L19-L21`, which requires `mbps > 200`.
     - gcode-parser: `test/gcode-3mf-plate.test.ts:L94` (200 ms), `test/gcode-3mf-plate.test.ts:L149` (500 ms),
       `test/summary.test.ts:L151` (30 s, commented as "a regression guard only").
     - profile-api: `test/catalogue-prusa.test.ts:L228` (3 s per tokenizer case).
   - **How verified:** `grep -rnE 'performance\.now|Date\.now|hrtime'` over every module's `test/`. SP8's own new tests
     count operations instead (for example `profiles/test/form-model-search.test.ts:L91`, a build-cost ratio below 3),
     and GCP-41's large-file test has a hang guard only (`large-file.test.ts:L46`).
   - **Fix:** count steps or allocations, as `profile-api/test/conditions-evaluate.test.ts:L90` does. Or drop the time
     bound and keep the test timeout as the hang guard. One card per board: VWR (3mf), GCP (gcode-bgcode,
     gcode-parser), PRF (profile-api).
   - **If we skip it:** they flake under parallel CI, the same way finding 3 does.

5. **The published profile-api package leaves out its provenance file** (`profile-api/package.json:L15-L19`)
   - **Module / layer:** profile-api, packaging.
   - **What this is:** `dist` contains catalogue data generated from OrcaSlicer and Bambu Studio (AGPL-3.0-only) and from
     Cura (LGPL-3.0-only). `PROVENANCE.md` records which data came from where, with commits and licences.
   - **Problem:** `files` lists only `dist`, `LICENSE` and `README.md`, so the npm package has no attribution and no
     LGPL notice. `profiles-data-orca/package.json:L15-L23` does this right: it ships PROVENANCE, NOTICE and both
     upstream licence files.
   - **How verified:** I read both `files` lists, and `ls profile-api` shows `PROVENANCE.md` sitting next to the
     package. I did not run `pnpm pack`. The licence field itself (`AGPL-3.0-or-later`) is still Q20, so no new card
     for it.
   - **Fix:** add `"PROVENANCE.md"` to `files`. Add the Cura LGPL text, or a pointer to it, when Q20 is decided.
   - **If we skip it:** each publish redistributes upstream data without the notice its licence requires.

## Nice to have

6. **Names longer than 1,024 characters lose their extension** (`printer-folder/src/domain/names.ts`, `prepare` and
   `longName`)
   - **Module / layer:** printer-folder, domain.
   - **What this is:** `sanitiseName` turns a file name into one that is safe on the printer's storage.
   - **Problem:** `prepare` cuts the input to `MAX_INPUT_LENGTH` (1024) before the extension is split off, so the
     extension is cut away with the rest.
   - **How verified:** `sanitiseName('x'.repeat(2000) + '.gcode', {longFilenames: true})` returns 255 characters with no
     `.gcode`. With 300 characters the result correctly ends in `xx.gcode`. The FAT path has the same cut.
   - **Fix:** in `prepare`, keep the last `.ext` (up to 64 characters, as `longName` allows) and cut only the stem. Add
     one test.
   - **If we skip it:** a very long project name uploads as a file without `.gcode`, and the printer does not list it.

7. **The slicer timeout setting accepts values `runProcess` will reject** (`slicer-extension/src/presentation/config.ts`,
   `package.json:L70-L76`)
   - **Module / layer:** slicer-extension, presentation.
   - **Problem:** `timeoutSeconds` accepts any positive finite number, and the schema has `minimum: 1` but no maximum.
     `runProcess` requires an integer `timeoutMs` in 1..2^31-1 (`run-process.ts:L106-L113`). So 3,000,000 s, or 1.0005 s
     once multiplied by 1000, will make every slice fail. The setting is not wired to `runProcess` yet, so this cannot
     happen today.
   - **How verified:** I read both bounds.
   - **Fix:** add `"maximum": 2147483` to the schema, and in the reader clamp and round to that range with a warning.
   - **If we skip it:** an odd setting will later surface as a slice error that names `timeoutMs`, which the user
     never typed.

8. **The notices script drops our own packages' upstream notices** (`tooling/bin/third-party-notices.mjs:L73`)
   - **Module / layer:** tooling.
   - **Problem:** every `@vsslicer/*` package is skipped. Once an extension bundles profile-api or profiles-data-orca,
     the notices file will leave out the Orca, Bambu and Cura attributions. No extension depends on them today, so this
     is not a problem yet.
   - **How verified:** read by the forked helper. I confirmed that the four extension `package.json` files do not
     depend on either package.
   - **Fix:** keep skipping them for the licence check, but copy in any NOTICE or PROVENANCE.md they ship.
   - **If we skip it:** the first extension that ships profiles goes out without its upstream notices.

9. **The exporter contract does not check output paths** (`profile-api/src/application/ports/contract.ts:L65`)
   - **Module / layer:** profile-api, application (ports).
   - **Problem:** an exporter's output file only needs a non-empty `path`, so `../../x` or `/etc/x` passes the contract
     check that adapters are tested against.
   - **How verified:** read `L65`.
   - **Fix:** reuse the unsafe-path check from `domain/bundle/bundle.ts`, and add one hostile-path case to the contract.
   - **If we skip it:** a later exporter adapter can write outside its folder and still pass its contract tests.

10. **A dead condition in the bundle reader** (`profiles-orca/src/adapters/archive/bundle-archive.ts:L109,L132`)
    - **Problem:** `host >= 0` is always true, and `data[p + 5]` is read without `need()`. The check still works
      because the mode bits are tested whatever the host is.
    - **Fix:** delete `host` and the `host >= 0 &&`. That removes two lines and changes nothing.
    - **If we skip it:** the next reader assumes the host byte matters.

One smaller item was left out: a printer instance may list the same toolhead slot twice
(`profile-api/src/domain/schema/printer-instance.ts:L8-L13`). Nothing reads instances yet.

## Checked, no finding (probes run)

- **profiles-orca bundle archive** (`readBundleArchive`). Each result below is a refusal before inflating, or a bound.
  - An 8 MiB zero entry: refused for its ratio. A central directory that says 1,000 bytes for 4 MiB: refused for
    inflating past the declared size, with RSS +20 MB.
  - 1,100 entries: refused by the count. 40 × 1 MiB: refused by the total.
  - A zip inside the bundle: kept as bytes and never opened.
  - `..`, ` .`, a trailing `.`, `C:`, a backslash, and names that differ only in case: all refused.
  - Garbage and empty input: refused. Writer to reader round trip: exact.
  - A 5 MB manifest and a 100k-deep one were stopped by the ratio cap.
- **profile-api `parseBundleStructure`:**
  - 20 MB refused in 0.0 ms. Depth 1e3 and 1e5 refused in a linear pass.
  - 20,000 files refused. `__proto__` and `constructor` keys did not pollute.
- **slicer-api `parseEngineManifest`:**
  - 1e6 and 1e8 characters refused before `JSON.parse`. Depth 30,000: refused.
  - 5,000 unknown keys gave 5,004 errors. That is bounded by the 64 KiB cap.
  - A `user@` URL and a backslash URL: refused. `__proto__` as a platform name: refused.
- **profile-api condition parser and regex engine:**
  - Nested-quantifier and alternation bombs (`(a{999}){999}){999}`, `(?:a{100}){100}`, `a{2147483648}`) are refused at
    5,000 NFA states.
  - Steps per (state × (subject + 1)) stay at or below 1.78 for 10 patterns at subject lengths 256 and 512.
    `((((a*)*)*)*)*b` took 6,400 steps at 256 and 12,800 at 512: linear.
  - Lookarounds and backreferences: refused.
  - Parser depth: a cap of 64 for `(`, `not` and long `or` chains. Over 64 KiB of source: refused.
  - All 815 `compatible_*_condition` lines in the pinned `PrusaResearch.ini` (PrusaSlicer-2.9) convert without failing:
    409 of them are lossy and none are null.
- **profiles-prusa conditions and tags:** the lexer's sticky regexes are linear. The tag core is limited to
  `[A-Za-z0-9_.|()[\]^\\*+?]{1,150}` and matched by profile-api's NFA, never by V8. The output is parsed again before
  it is returned (`convert.ts:L186`).
- **profiles-cura and profiles-orca condition builders:** materials with `\n`, `/`, `é` or U+2028, and printer ids with
  `'`, `\`, newline or NUL, all produce conditions that `parseCondition` accepts. Chunking stays at or below 200
  characters per regex and 32 clauses.
- **3mf (SP6 fixes, run again):**
  - Billion laughs and an external `SYSTEM` entity: saxes refuses them as an undefined entity in 0 to 2 ms.
  - `readModel` depth 1e5 and 1e6: refused at 64.
  - Component fan-out (10^5, 10^8, 1000^2 and 2^39 parts): every case refused at `MAX_PARTS` in 52 to 72 ms.
  - A declared total over 1 GiB: refused before inflating. A lying declared size: refused.
  - 100,000 attributes in one tag: 93 ms.
- **3mf without `.reference`:** every test that reads `.reference` is guarded by `skipIf(!existsSync)`, or filters its
  `test.each` list through `existsSync` (`opc.test.ts:L103,L113`, `production.test.ts`, `readModel.test.ts`,
  `resolveProject.test.ts`, `editPackage.test.ts`; the same in profile-api, profiles-prusa, profiles-orca and
  profiles-cura). This was checked by reading. I did not hide `.reference` and run the suite again.
- **mesh OBJ fan-out** (SP7 asked for this probe):
  - One face of 30k refs gave 29,998 triangles in 12 ms. 300k refs gave 299,998 in 65 ms, which is linear.
  - With a cap of 1e5 it throws at 100,001. 40 lines of 150k refs throw at 1,000,001.
  - Lines are capped at 1 MiB (`text.ts:L5`).
- **gcode-parser `.gcode.3mf`:** `slice_info.config` is read with a linear tag scanner (`gcode-3mf-plate.ts:L60-L105`).
  The declared size decides before inflating, and thumbnails are capped at 4 MiB and 16 in all. This was checked by
  reading: the scanner is not exported, so I did not probe it.
- **slicer-runtime `runProcess`:**
  - 200 MiB of output with no newline: one line of 65,536 characters kept, `longLines` 1, heap +0 MB.
  - 2 M short lines: 10,000 kept, `onLine` called 2 M times, `outputTruncated` set.
  - An emoji split across two writes is decoded intact.
  - argv only (no shell), NUL refused, and the whole process group is killed.
- **printer-folder names:**
  - 4,096 identical names gave 4,096 unique FAT names in 8 ms.
  - `uniqueName` against 4,096 existing names: 2 ms.
  - `con.gcode` becomes `_con.gcode` (long names) or `CON_.GCO` (FAT). Lone surrogates are replaced, and NFC/NFD
    forms collide as intended.
- **agent-protocol `AgentError.fromJSON`:**
  - A `__proto__` key in the data stays plain data (no pollution).
  - A non-integer code, a non-object and an inherited-property object all become `InternalError`.
  - A 1 MB message is cut to 4,096 characters.
- **gcode-preview text pane flood (GCP-39):** one read in flight, and a newer request replaces the one waiting
  (`application/preview-session.ts:L132-L146`). Requests are validated, the host reads at most 64 KiB and returns at
  most 400 lines. Checked by reading.
- **Forked helper's reading of the SP7-skipped areas:**
  - `convert-key.ts` and `rules.ts`: 12 conversions from native to unified and back, all correct. Examples: Cura flow
    95 becomes 0.95, Cura support angle 50 becomes 40, Prusa `110%` stays a percentage, and 110% of base 0.4 becomes
    0.44, marked lossy.
  - The C++ tokenizer (`cpp.ts:L55-L183`): every branch moves forward, raw strings end at the right place, and
    unterminated strings throw. Three small gaps run at build time only on pinned files and do not change the
    generated catalogue: `\x` reads only 2 hex digits, octal escapes are not decoded, and a comment that starts on a
    `#` line can affect the next line.
  - The gcode-preview side panel (`side-panel.ts`, `domain/panel.ts`): file strings reach the page only as text,
    images must be PNG and at most 4 MiB, lists are capped, and object URLs are released (`main.ts:L340-L341`).
  - `third-party-notices.mjs`: the allow-list, stale-entry and outside-module checks are correct.
- **Architecture:**
  - No `vscode` import outside `presentation/`: grep over every module's `src` found none.
  - No relative import reaches into another module (`../../../` and `modules/` grep, none).
  - The 12 new scaffolds are 0.0.0 with domain, application and index layers only.
  - SP8's new tests count operations instead of timing, except finding 3.

## Not checked

- `profile-api/tools/catalogue/prusa.ts`, `cura.ts` and `groups.ts`: only `cpp.ts` was read. I did not compare the
  generated catalogue with the committed data.
- Whether the Cura nozzle-offset sign matches Orca's `extruder_offset`: this needs upstream research.
- The `profiles` form model beyond its search bounds, and the details of `locate.ts`. Example: the Cura folder keeps
  only the first 64 entries in listing order, not version order. With 64 or more entries a new version could be
  missed, but that is not realistic.
- printer-api auth and capability semantics against the printer research. printers-extension and slicer-extension
  activation code beyond config and tasks.
- The 3mf suite with `.reference` actually missing. Probes run under Node with type stripping, not inside vitest.
  `pnpm pack` output for any package.

## Cards

| Finding | Severity | Board | Model | Card |
|---|---|---|---|---|
| 1 Depth cap in 3mf `startTags` and `scanModel` (quadratic saxes nesting) | must fix (P0) | VWR | sonnet | VWR-394 |
| 2 Cap total entries in the Prusa INI reader (1.2 GB from 64 MiB) | should fix (P1) | PRF | sonnet | PRF-185 |
| 3 Make the `runProcess` kill tests independent of node start-up time | should fix (P1) | SLC | sonnet | SLC-277 |
| 4a Replace wall-clock asserts in 3mf tests | should fix (P1) | VWR | sonnet | VWR-395 |
| 4b Replace wall-clock asserts in gcode-bgcode and gcode-parser tests | should fix (P1) | GCP | sonnet | GCP-115 |
| 4c Replace the wall-clock assert in profile-api `catalogue-prusa.test.ts` | should fix (P1) | PRF | sonnet | PRF-186 |
| 5 Ship `PROVENANCE.md` in the profile-api package | should fix (P1) | PRF | sonnet | PRF-187 |
| 6 Keep the extension when cutting names over 1,024 characters (printer-folder) | nice to have (P2) | PRN | sonnet | PRN-443 |
| 7 Bound the slicer timeout setting to what `runProcess` accepts | nice to have (P2) | SLC | sonnet | SLC-278 |
| 8 Copy NOTICE/PROVENANCE of bundled `@vsslicer` packages into third-party notices | nice to have (P2) | PLT | sonnet | PLT-195 |
| 9 Check exporter output paths in the profile-api port contract | nice to have (P2) | PRF | sonnet | PRF-188 |
| 10 Delete the dead `host >= 0` check in the Orca bundle reader | nice to have (P2) | PRF | sonnet | PRF-189 |
