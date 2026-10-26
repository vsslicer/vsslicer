# SP10 audit

Date: 2026-10-26. Range: `git diff a5f14ccb..HEAD -- vsslicer/` (39 commits, up to `93935bed`). Leaving out the
profiles-data-orca data and the lockfiles, that is 217 files and about 64,900 added lines. Most of those lines are
data: the profile-catalogue-data JSON (about 47,000 lines, copied byte for byte from profile-api), the schema copies
and the fixtures. The new source is about 7,500 lines.

Auditor: `sp10-auditor`, a fresh Opus agent that wrote none of SP10's code. Read-only: I changed no code, no cards and
no git state. The only file I wrote is this report.

Scope:
- First, whether the twelve SP9 findings were fixed, and whether the fixes hold.
- Then the sprint's new code that reads untrusted input:
  - the profiles-prusa downloader, INI import and physical printers (PRF-40, PRF-25, PRF-34, PRF-26, PRF-89)
  - the profiles-orca tree reader, variants and split (PRF-27, PRF-28, PRF-126)
  - the profiles-cura definitions, quality and fdm_materials readers (PRF-30, PRF-31, PRF-32)
  - printer-api `PrinterStatus` (PRN-4) and printer-folder safe-write (PRN-132)
  - the 3mf dialect detection (VWR-13) and profile-catalogue-data's loader (PRF-192)
- Then tooling (PLT-198, PLT-202), the runner (PLT-200), profiles-extension (PRF-57, PRF-60, PRF-67) and the
  gcode-preview memory bench (GCP-42).
- **Coordinator-passed cards, looked at more closely** (the coordinator asked for this mid-audit, because no fresh
  reviewer checked them): PRF-26, PRF-31, PRF-32, PRF-34, PRF-57, PRF-60, PRF-67, PLT-200, PLT-202, SLC-280, GCP-42
  and PRF-126. I checked all twelve. Findings 2 (PRF-26), 6 (PRF-34) and 14 (PLT-200) come from these cards. The
  others are covered under "Checked, no finding".

Method: `/ponytail:ponytail-audit`.
- Three forked helpers each took one area: profiles-prusa; profiles-orca with profiles-cura; and printer-api,
  printer-folder, slicer-runtime and mesh. I took the SP9 fixes, tooling, the runner, 3mf, profile-catalogue-data,
  profiles-extension and the bench.
- Every probe ran in a `mktemp -d` directory and loaded a module's `src/` by absolute path under Node 26.12. The
  directories were deleted afterwards.
- Real upstream data was only read, from `.reference/repos`.
- After the background `run.mjs ci` finished, I ran the full suites of nine modules. All pass:

  | Module | Tests |
  |---|---|
  | profiles-prusa | 239 |
  | profiles-orca | 93 |
  | profiles-cura | 101 |
  | printer-api | 41 |
  | printer-folder | 70 |
  | profiles-extension | 8 |
  | profile-catalogue-data | 25 |
  | 3mf | 186 |
  | slicer-runtime | 78, plus 1 skipped |

  I also ran the runner tests (122) and the tooling licence and package tests (30).

Load assumed: one person on a desktop opening files they downloaded or exported from another slicer. That covers vendor
bundles, Orca and Bambu trees, Cura resource folders, fdm_materials XML, INI presets and 3MF files. The printers
send status pushes several times a second for hours.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. In SP10:
- The profile modules learned to read the real profile trees of PrusaSlicer, SuperSlicer, Orca, Bambu and Cura, and
  to split printer presets into model, nozzle and overrides.
- The catalogue data moved toward its own AGPL-3.0-only package.
- printer-api defined the normalised printer status.
- printer-folder writes files safely.
- A profiles extension scaffold ships the JSON schemas.

## Earlier audit (SP9-audit.md): the fixes

Eight of the twelve SP9 cards were done in SP10. Seven of those hold. SLC-279 holds only in part.

The other four were not done in SP10. They were moved to later sprints, against the sprint-cycle rule that audit
bugfix cards go into the next sprint:

| Card | Moved to |
|---|---|
| GCP-118 | SP11 |
| PRF-195 | SP13 |
| PRF-196 | SP22 |
| PRF-198 | SP22 |

1. **Cura names with a colon or trailing dot (PRF-194).** Holds.
   - The colon and trailing dot or space rules are gone. Empty names, NUL, backslash, absolute paths and `.`/`..` are
     still refused.
   - The drive-letter rule went too. That is fine, because the names stay in memory.
   - Read by a helper; the profiles-cura suite passes.
2. **Follow position before the moves arrive (GCP-118).** Not done. The card is in the gcode backlog for SP11, so
   the bug is still open.
3. **Prusa YAML diagnostics cap (PRF-195).** Not done (SP13). Still open.
4. **Wall-time asserts (GCP-119, VWR-396).** Both hold.
   - The mesh test now counts chunks, at most 32. The 1 MiB line cap stops after about 17, and without the cap all
     200 are read, so the test fails as it should.
   - The planner test counts marker reads through a Proxy: at most 4 per marker, and at most 2.5× when the input
     doubles. A regression that copies `markers` first and then scans the copy per move would still pass. I did not
     run a mutation.
   - A grep for `performance.now|Date.now|hrtime` over every module's `test/` finds only webview-kit's wait-until
     guard and a timing log, as in SP9.
5. **AGPL-3.0-only claim (PLT-198).** Holds. `check-licence.mjs:L52-L63` now requires a non-empty PROVENANCE.md and a
   name in `onlyPackages`. Probe: a fixture with an empty PROVENANCE.md and the name `@vsslicer/x` was refused with
   both messages.
6. **`parseUrl` fetching before the queue check (VWR-397).** Holds.
   - `pool.ts:L143-L151` counts running, queued and fetching calls before it fetches, and frees the slot in
     `finally`.
   - Tests: 10 calls to a capacity of 2 give 2 fetches and 8 refusals. A failed fetch frees its slot.
7. **Archive collisions as `ArchiveError` (SLC-279).** Holds for files only. See finding 12.
8. **tar.gz bound and sha256 (SLC-280).** Holds.
   - A tar.gz without a sha256 is refused (probe).
   - The ratio is checked against the archive's real size.
   - The hash and the extraction read the same open file.
9. **YAML documents and the node cap (PRF-196).** Not done (SP22).
10. **`generate.mjs` swap (PRF-197).** Holds. It renames `data` to `data.old`, renames `data.tmp` to `data`, and
    puts the old data back if the second rename fails. One corner is left: if putting the old data back also fails,
    `finally` deletes `data.old`. The data can be regenerated from the pinned clones, so this is not a finding.
11. **Test-only `readBounded` (PRF-198).** Not done (SP22).

## Must fix

1. **When a printer model and a printer preset share a name, one of them is dropped**
   (`profiles-prusa/src/adapters/import/import.ts:L378-L388`, ids from `L191` and `split.ts:L53-L62`)
   - **Module / layer:** profiles-prusa, adapters (import).
   - **What this is:** `add` puts every entity of one file into a single id space, keyed by the bare id. It skips a
     repeated id with a warning. A model's id is its section name, and a nozzle's id is its printer preset's name.
   - **Problem:** PrusaSlicer keeps printer models, printer presets, prints and filaments in separate collections,
     so the same name in two kinds is legal, and real bundles use it.
   - **How verified:** I imported the live bundles from `.reference/repos/PrusaSlicer-settings@a40f669`.
     - `Sovol/1.0.0.ini` skipped 8 ids (SV01, SV01 PRO, ... SV06). The model `SV06` lists the nozzle `"SV06"` and has
       an override for it, but the nozzle entity was dropped.
     - `Jubilee/1.0.0.ini` skipped 2. What survives as `Jubilee` is the empty printer_model, with 0 settings. All of
       `[printer:Jubilee]` is lost.
     - All 9 same-name pairs inside a single live bundle are printer_model/printer pairs.
     - User presets hit it too. `print/My MK4.ini`, `filament/My MK4.ini` and `printer/My MK4.ini` gave 1 entity
       and 2 "already imported" warnings.
   - **Fix:** check duplicates per kind and id. When another kind already holds the id, give the later entity an id
     qualified by its kind, and keep the original name in `native.name`. Add a test with `[printer_model:SV06]` and
     `[printer:SV06]`. If `ImportResult.native` should be keyed by kind in profile-api instead, that needs design
     judgment (model=opus).
   - **If we skip it:** Sovol and Jubilee printers import without their settings or nozzles, and a user's presets
     that share a name across kinds collapse into one.

## Should fix

2. **Five old PrusaSlicer keys are in the SuperSlicer-only list, so 214 Prusa presets are marked SuperSlicer**
   (`profiles-prusa/src/adapters/import/superslicer-keys.ts:L315, L353, L356-L358`, used at `import.ts:L283`;
   card PRF-26)
   - **Module / layer:** profiles-prusa, adapters (import).
   - **What this is:** a section is marked `dialect: 'superslicer'` when it holds any key from this list.
   - **Problem:** five keys in the list are PrusaSlicer's own, removed in 2.9.0 and 2.7.3:
     - `wipe_tower_x`, `wipe_tower_y` and `wipe_tower_rotation_angle`
     - `wiping_volumes_extruders`
     - `support_points_minimal_distance`

     They are on PrusaSlicer's legacy-ignore list (`PrusaSlicer-2.9@b028299:src/libslic3r/PrintConfig.cpp:L5266-L5283`).
   - **How verified:** importing `PrusaSlicer-2.9@b028299/resources/profiles/PrusaResearch.ini` gave 6,533 entities,
     and 214 were marked SuperSlicer.
     - One example: `print:0.30mm DETAIL @0.8 nozzle`, which sets `wipe_tower_x = 170`.
     - The list overlaps the ignore list in exactly those 5 keys, and the 544 live 2.9 keys in none.
   - **Fix:** delete the 5 keys. That leaves 351, so fix "356" in the comment and in the CHANGELOG too. Add a test: a
     section with `wipe_tower_x = 170` is `prusa`.
   - **If we skip it:** Prusa's own presets carry the wrong dialect, and any code that branches on the dialect treats
     them as SuperSlicer.

3. **A heater or tray id cut to the length cap makes every later status merge that names it throw**
   (`printer-api/src/domain/status.ts:L267-L283` `byKey`, with `str` at L141-L146 and `unique` at L162)
   - **Module / layer:** printer-api, domain.
   - **What this is:** `createPrinterStatus` cuts a heater `id` or a material `tray` longer than 256 characters and
     records `tooLong`. `byKey` then matches the items of a patch to the stored items by exact key.
   - **Problem:**
     - The next push carries the full id again, so it does not match the stored 256-character id.
     - `byKey` appends it as a new item.
     - After the cut it equals the stored id, and `unique` throws `duplicate`.
     - Every later push that names that heater or tray fails.
   - **How verified:** a base with `heaters:[{id:'h'×300}]` builds and records `tooLong`. Then
     `mergeStatus(base,{heaters:[{id:'h'×300,current:200}]})` throws
     `InvalidStatusError printer status heaters[1].id: duplicate`. `materials[].tray` fails the same way.
   - **Fix:** in `byKey`, compare keys after the same cut (`String(p[key]).slice(0, STATUS_LIMITS.id)`). Add a test
     that pushes a 300-character id twice.
   - **If we skip it:** one over-long heater name from buggy or hostile firmware stops all status updates for the
     session. No connector calls this yet.

4. **The Orca tree reader and folder loader never cap their diagnostics**
   (`profiles-orca/src/adapters/tree/read-tree.ts:L146-L147`, growth at `L366-L371`; `load-tree.ts:L23-L24`, `L39-L40`)
   - **Module / layer:** profiles-orca, adapters (tree).
   - **What this is:** every problem found while reading an Orca or Bambu tree adds one diagnostic, with no limit.
     The Cura readers from the same sprint stop at 1,000 (`MAX_RESOURCE_DIAGNOSTICS`) and add one "suppressed" line.
   - **Problem:**
     - Take one preset with 64 missing `include` names, listed N times under different names in the vendor index.
       It reports 64 × N warnings, and nothing is charged to the merge budget.
     - `loadProfileTree` counts only `.json` files against `maxFiles`. Symlinks and other entries are each reported,
       with no limit.
   - **How verified:**
     - A 366 KB input gave 640,000 diagnostics and +114 MB of heap.
     - A 1.85 MB input gave 3,199,936 diagnostics and +455 MB of heap, in 3.5 s.
     - `loadProfileTree(root,{maxFiles:10})` on a folder of 30,000 symlinks and 30,000 `.txt` files read 0 files and
       gave 30,000 diagnostics.
   - **Fix:**
     - Send both `report` functions through one capped push, as the Cura readers do.
     - Count every directory entry against `maxFiles`, as `profiles-cura/src/adapters/definitions/folder.ts:L52`
       does.
     - Add one test: 1,000 or more missing includes give at most 1,001 diagnostics.
   - **If we skip it:** a hostile 2 MB bundle adds about 450 MB to the extension host. This is the same kind of bug as
     SP9 finding 3, which is still open as PRF-195.

5. **A physical printer `host_type` of `constructor` turns into a function, and the credential is still attached**
   (`profiles-prusa/src/adapters/physical/read.ts:L28-L33` `HOST_MAP`, looked up at `L59`)
   - **Module / layer:** profiles-prusa, adapters (physical).
   - **What this is:** the reader maps the `host_type` from the file through a plain object literal.
   - **Problem:** `constructor`, `toString`, `hasOwnProperty` and `__proto__` find values inherited from
     `Object.prototype`. They are truthy, so they pass the `if (!hostType)` check.
   - **How verified:**
     - INI `host_type = constructor` gave `typeof host_type === 'function'`, with the credential `SECRET` attached and
       no diagnostic.
     - The 3.0 JSON reader (`physical_printer_host_type`) does the same.
   - **Fix:** `Object.hasOwn(HOST_MAP, f.hostType) ? HOST_MAP[f.hostType] : undefined`, plus one test.
   - **If we skip it:** a crafted file yields a printer instance whose host type is not valid, with a credential
     attached to a connection that is not valid either.

6. **When printers are split into nozzles, each nozzle's default print and filament are lost**
   (`profiles-prusa/src/adapters/import/import.ts:L246-L255`, `split.ts:L53-L62`; card PRF-34)
   - **Module / layer:** profiles-prusa, adapters (import).
   - **What this is:** `toEntity` reads `default_print_profile` and `default_filament_profile` into the printer's
     `defaults`, and marks both keys as consumed. `splitVariants` then makes a `Nozzle` that keeps only the id,
     diameter, flow and `renamed_from`.
   - **Problem:** after the split, no entity holds the defaults. The keys are marked consumed, so they are not in
     `native_only` either, and nothing records that they were dropped.
   - **How verified:** imported `test/fixtures/ini/mk4s-nozzles.ini`.
     - Neither `0.20mm SPEED @MK4S 0.4` nor `0.25mm SPEED @MK4S 0.6` appears anywhere in the result.
     - No `native_only` list holds `default_print_profile`.
   - **Fix:** when a preset becomes a nozzle, add both keys back to `native.native_only` in `splitVariants`, with one
     assertion in the split test.
   - **If we skip it:** a 0.6 mm nozzle's default print and filament are gone from any export or view built from the
     unified entities.

7. **`unescapeStrings` is a second copy of `splitList`** (`profiles-prusa/src/adapters/physical/read.ts:L80-L109`
   and `import/flatten.ts:L28-L69`)
   - **Module / layer:** profiles-prusa, adapters (lean: merge).
   - **What this is:** both functions port PrusaSlicer's `unescape_strings_cstyle`.
   - **How verified:** 200,000 random strings built from `a`, space, `;`, `"`, `\`, `n` and tab gave 0 differences.
   - **Fix:** delete `unescapeStrings` (30 lines) and import `splitList`, which `test/adapters/import.test.ts:L273`
     already tests.
   - **If we skip it:** a fix to one copy will miss the other.

## Nice to have

8. **The inherited-keys cap lets a 168 KB file cost 310 MB** (`profiles-prusa/src/adapters/import/import.ts:L30`
   `MAX_INHERITED_KEYS = 4_000_000`, `flatten.ts:L156-L164`)
   - **Module / layer:** profiles-prusa, adapters (import).
   - **Problem:** the cap is about 8 times what the pinned bundle needs. Each entity also stores its values twice:
     once in a `Map` and once in `native.values`.
   - **How verified:** one parent with 3,000 keys and 3,000 children that inherit it, 168 KB in all. The import
     stopped at the cap after 1,333 entities. It held +310 MB of heap after garbage collection and took 1.4 s.
   - **Fix:** lower the cap to 1,000,000. The pinned bundle needs 476,151, so that is still 2× headroom, and the
     worst case drops to about 80 MB.
   - **If we skip it:** a hostile preset costs a few hundred MB, but the cost stays bounded.

9. **A Cura container named `__proto__` loses its metadata** (`profiles-cura/src/adapters/quality/read.ts:L191`,
   `L242`; `materials/fdm-material.ts:L122`)
   - **Module / layer:** profiles-cura, adapters (quality, materials).
   - **Problem:**
     - `native[c.id] = {...}` writes into a plain object, and the id comes from the file name.
     - For `quality/__proto__.inst.cfg`, that replaces the prototype of `native`, so `Object.keys` and
       `JSON.stringify` leave the container out.
     - `<setting key="__proto__">` in fdm_materials XML is dropped silently.
     - The global `Object.prototype` is not touched.
   - **How verified:** with two qualities, `__proto__` and `normal`, the entities were both, but `native` had only
     `normal` as its own key, and its prototype was replaced. The fdm probe printed `native {}`.
   - **Fix:** use `Object.create(null)` for both `native` objects and for `unmapped`, as
     `profiles-orca/src/adapters/split/split.ts:L55` does. Add one test.
   - **If we skip it:** only an odd or hostile file name hits it, and that container's metadata is lost on export.

10. **`curaStackValue`'s comment states a rule the code does not apply** (`profiles-cura/src/domain/stack.ts:L25-L29`)
    - **Module / layer:** profiles-cura, domain.
    - **Problem:** the comment says a key that is not `settable_per_extruder` is read from the global stack only. The
      function walks every stack it is given.
      `curaStackValue('machine_width', {user:{machine_width:1}}, global)` returns the extruder's 1, where Cura reads
      the global value.
    - **How verified:** read, plus a grep: the only callers are `test/definitions.test.ts:L173-L180` and the export.
    - **Fix:** say in the comment that the caller passes only the global stack for keys that are not per-extruder, or
      drop the export until a real caller exists.
    - **If we skip it:** the first real caller trusts the comment and reads global-only keys from the extruder.

11. **A `null` list item in a status push throws a plain `TypeError`** (`printer-api/src/domain/status.ts:L191-L252`,
    `byKey` L277-L278)
    - **Module / layer:** printer-api, domain.
    - **Problem:** `heaters:[null]` makes both `createPrinterStatus` and `mergeStatus` throw
      `TypeError: Cannot read properties of null`, not `InvalidStatusError`. An adapter that catches `PrinterError` to
      drop a bad push will not catch it.
    - **How verified:** probe, through both entry points.
    - **Fix:** refuse non-objects first, in `Builder.list` and `byKey`, with `InvalidStatusError(f, 'invalidValue')`.
    - **If we skip it:** one bad item from a loosely mapped printer response crashes the update instead of being
      refused.

12. **A name collision with a symlink still throws a raw `EEXIST` error (SLC-279 is half fixed)**
    (`slicer-runtime/src/adapters/extract-archive.ts:L262`, `symlink` in `finish()`)
    - **Module / layer:** slicer-runtime, adapters.
    - **Problem:** SLC-279 maps `EEXIST` to `ArchiveError` only in `Output.file()`. Symlinks are created later, in
      `finish()`, and that call does not map the error.
    - **How verified:** tar.gz archives with their correct sha256.
      - An NFC file next to an NFD file gives `ArchiveError ... collides`, in both tar.gz and zip.
      - An NFC file next to an NFD symlink gives `Error EEXIST: file already exists, symlink`. Two symlinks give the
        same raw error.
      - Staging was cleaned up every time.
    - **Fix:** wrap L262 the same way `file()` does, and add one test with an NFC file and an NFD symlink.
    - **If we skip it:** a caller that treats `ArchiveError` as "bad archive" and anything else as an internal failure
      mislabels these archives.

13. **`detectDialect` misses part names with a leading `/` or in a different case** (`3mf/src/domain/detectDialect.ts:L46-L52`)
    - **Module / layer:** 3mf, domain.
    - **Problem:**
      - The function matches `Metadata/Slic3r_PE.config`, `Metadata/PrusaSlicer3_project.json` and `Cura/` exactly.
      - OPC part names are not case-sensitive, and the module's own `opcEdit.ts:L12` strips a leading `/` and
        lowercases names before comparing them.
      - PrusaSlicer itself matches its config part case-insensitively
        (`PrusaSlicer-2.9@b028299:src/libslic3r/Format/3mf.cpp:L839, L882, L4080`, `boost::algorithm::iequals`).
    - **How verified:** probe:
      - `['/Metadata/Slic3r_PE.config']` gives `core`.
      - `['metadata/slic3r_pe.config']` gives `core`.
      - `['/Cura/x.cfg']` gives `core`.
      - `['Metadata/Slic3r_PE.config']` gives `prusa2`.

      There is no production caller yet, so it depends on how the reader passes names.
    - **Fix:** normalise once at the top: strip a leading `/` and compare in lower case, with one test row each.
    - **If we skip it:** a package written by a tool that uses another case, or a caller that passes OPC-style
      `/`-prefixed names, is read as plain `core`.

14. **The runner's devDependency-cycle handling serves no cycle that CI can install** (`scripts/lib.mjs:L240-L343`
    Tarjan and dropped edges, `run.mjs:L354`; card PLT-200)
    - **Module / layer:** `vsslicer/scripts` (lean: yagni).
    - **What this is:** PLT-200 added about 60 lines (iterative Tarjan, dropped dev edges, a stderr note) so that
      `order` accepts a cycle closed by a devDependency.
    - **Problem:**
      - No such cycle exists today: `run.mjs build --list` prints no note.
      - The one cycle it was built for (profile-api ↔ profile-catalogue-data, PRF-193) cannot install on a clean
        registry, which is what CI starts from. PRF-193's card already says the cycle must be broken at install
        time, by moving the generator out of the package.
      - Once that is done, this code has nothing left to order.
    - **How verified:** read; a probe of `order` (the dev cycle is accepted with the note, a runtime cycle throws, and
      a chain of 200,000 modules does not overflow the stack); the runner tests pass (122).
    - **Fix:** when PRF-193 lands, return `order` to a plain DFS that throws on any cycle, and drop `devDeps` from
      `run.mjs`. Keep the iterative DFS.
    - **If we skip it:** about 60 lines of graph code stay to be read and kept up for a case CI cannot reach.

## Checked, no finding (probes run)

- **profiles-prusa downloader (PRF-40).** A fake `fetch` served real gzip and tar data. Each of these was refused
  with `DownloadError`, and nothing was left in the target folder:
  - `..`, including through a pax `path` header
  - a symlink entry
  - a header naming the wrong commit
  - two names that differ only in case
  - a 300 MiB gzip bomb
  - a redirect from https to http
  - a body past the byte cap

  A good archive was placed correctly. The commit pin comes from the tar header the server sends, and there is no
  sha256. A redirect to another https host is accepted. That is acceptable while the source is GitHub over TLS. It
  differs from SLC-280's "sha256 before extracting a tar.gz", if that rule was meant to cover every downloader.
- **Prusa INI import (PRF-25, PRF-26, PRF-34).**
  - Inheritance cycles, self-inheritance and duplicate parents are handled.
  - A `__proto__` section name is stored as an own key (`import.ts:L386`).
  - The per-key line lookup is not quadratic: 2, 20 and 35 ms at 0, 100k and 400k extra keys.
  - Nozzle override quoting round-trips `Bob's MK4S \ 0.6`.
  - The same name across different vendor bundles is skipped, as upstream does.
- **Orca and Bambu trees (PRF-27, PRF-28, PRF-126), on real data.**
  - Orca: 14,420 files gave 1,635 entities in 5.2 s, with no diagnostics and no duplicate ids.
  - Bambu: 3,589 files gave 294 entities in 1.2 s.
  - A preset named `__proto__` keeps its keys as data.
  - A 40-link chain with 40,000 leaves takes 156 ms.
  - Symlinks are refused, and files are opened with O_NOFOLLOW.
  - 32 Orca presets keep their variant arrays with a warning. That is the documented difference from upstream.
- **Cura (PRF-30, PRF-31, PRF-32), on real data.**
  - The resource folder: 9,002 files gave 706 definitions, 544 extruders, 1,741 variants and 6,011 qualities in
    1.8 s, with 29 diagnostics.
  - fdm_materials: 281 materials, 0 diagnostics.
  - A 20,000-file inheritance cycle takes 42 ms, with diagnostics capped at 1,001.
  - fdm XML: a DOCTYPE is refused, nesting over 32 is refused, more than 100,000 elements are refused, and a 5 MB
    text node is refused.
  - Folders are checked with `lstat` before and after listing.
  - There is no `node:fs` import outside `adapters/`, except the re-export entry `src/materials.ts`.
- **printer-folder safe-write (PRN-132).**
  - A symlinked destination is replaced, and the file it pointed to is untouched.
  - A directory with the final name is refused, and the temp file is removed.
  - 50 concurrent writes of one name give one complete file and no leftover `.TMP`.
  - fsync runs before close, and directory fsync errors are tolerated.
- **printer-api status (PRN-4).**
  - NaN and Infinity are refused.
  - Integers must be safe integers.
  - Enum values are checked.
  - A JSON `__proto__` key is dropped.
  - Lists are capped while they are read, and merges stay within those caps.
- **profile-catalogue-data (PRF-192).** The six JSON files are byte-identical to profile-api's. `checkCatalogueJson`
  walks the value iteratively, and the module's tests cover depth, key and byte caps and bad limits.
  - Until PRF-193 (SP13), profile-api still holds its own copy of the data and of the generator.
  - The two generator copies differ by 2 to 11 lines per file: SPDX headers and import paths.
  - This is planned, not a finding. Nobody should regenerate in profile-api before then.
- **check-licence (PLT-198):** see SP9 item 5 above.
- **vsslicer-package `schemaRefs` (PLT-202).** Probed with:
  - a `../` escape
  - a symlink to a file outside the extension folder
  - an `https:` ref
  - a ref cycle
  - a same-file `#` pointer

  The escape, the symlink and the `https:` ref were refused. The cycle ended, and the `#` pointer was skipped. On the
  real profiles-extension, it finds exactly `schemas/defs.json` with no problems. One thing is not handled: a
  percent-encoded ref (`my%20defs.json`) is reported missing, because it is not URI-decoded. No schema uses one, so
  this is not a finding.
- **profiles-extension (PRF-57, PRF-60, PRF-67).**
  - `vscode` is imported only in `presentation/extension.ts`.
  - The schema copies differ from profile-api's only in the `$id` prefix, and `test/schemas.test.ts` checks that.
  - The fixtures carry PROVENANCE files.
  - 8 tests pass. I did not run the VS Code integration test.
- **gcode-preview bench (GCP-42).** It measures bytes, never time, and fails on a budget overrun. It is not part of
  `test` or CI. The budgets are per OS, and the linux budget was measured on arm64. The x64 CI runner is unverified,
  as `budget.json` itself says.
- **profiles-data-orca `generate.mjs` (PRF-197):** see SP9 item 10 above.
- **Architecture.** No `vscode` import outside `presentation/`. No relative import into another module: the only
  `../../..` paths are the generator's `.reference/repos` paths.

## Not checked

- GCP-118's bug (SP9 finding 2): it is still open, and I did not re-probe it.
- Case collisions on a case-insensitive volume, Windows reserved names (`CON`) and 8.3 names in downloaded or
  extracted archives. The probe volume is case-sensitive macOS.
- A real codeload download for PRF-40. Every fetch was faked.
- The SuperSlicer key list against PrusaSlicer 3.0 keys: the `.reference` PrusaSlicer clone has no `src/libslic3r`.
- `readCuraUserChanges` on a real Cura user folder. Only the fixtures were read.
- The VS Code integration tests (profiles-extension and others), and `pnpm pack` of the new modules.
- A mutation run of the GCP-119 planner test.
- Windows rename over a file another process holds open, for safe-write. Also not checked: temp files on another
  device.
- Full suites of gcode-preview, gcode-planner, mesh, tooling and gcode-language. Only the targeted tests were run.

Verdict: one must-fix, finding 1 (Prusa model and printer presets with the same name are dropped), then findings 2 to
6. Four SP9 fixes (GCP-118, PRF-195, PRF-196, PRF-198) were pushed past SP11, against the sprint-cycle rule.

Lean: -90 lines possible (findings 7 and 14), -0 dependencies.

## Cards

Created by the SP10 coordinator in SP11 (`sprint: VSS:SP11`), linked to this report.

| Finding | Severity | Board | Model | Card |
|---|---|---|---|---|
| 1 Keep both entities when a Prusa printer model and printer preset share a name | must fix (P0) | profiles | opus | PRF-202 |
| 2 Remove the five PrusaSlicer keys from the SuperSlicer-only key list | should fix (P1) | profiles | sonnet | PRF-203 |
| 3 Let a status push name a heater or tray whose id was cut | should fix (P1) | printers | opus | PRN-446 |
| 4 Cap the diagnostics of the Orca tree reader and folder loader | should fix (P1) | profiles | sonnet | PRF-204 |
| 5 Look up physical printer host_type by own key only | should fix (P1) | profiles | sonnet | PRF-205 |
| 6 Keep each Prusa nozzle's default print and filament profile when splitting | should fix (P1) | profiles | sonnet | PRF-206 |
| 7 Replace the duplicated unescapeStrings with splitList in the physical printer reader | should fix (P1) | profiles | sonnet | PRF-207 |
| 8 Lower the Orca inherited-keys cap to the measured need | nice to have (P2) | profiles | sonnet | PRF-208 |
| 9 Keep the metadata of a Cura container named __proto__ | nice to have (P2) | profiles | sonnet | PRF-209 |
| 10 Make curaStackValue's comment match the rule it applies | nice to have (P2) | profiles | sonnet | PRF-210 |
| 11 Refuse a null list item in a status push with InvalidStatusError | nice to have (P2) | printers | sonnet | PRN-447 |
| 12 Report a symlink name collision as ArchiveError in extractArchive | nice to have (P2) | slicer | sonnet | SLC-281 |
| 13 Match 3MF part names with a leading slash or other case in detectDialect | nice to have (P2) | viewer | sonnet | VWR-398 |
| 14 Delete the runner's devDependency-cycle ordering once PRF-193 lands | nice to have (P2) | platform | sonnet | PLT-203 |

SP9 bug cards still open, moved back to SP11 (the rebalance had pushed them out): GCP-118, PRF-195, PRF-196, PRF-198.
