# SP6 audit

Date: 2026-10-26. Range: `git diff 470d05f..HEAD -- vsslicer/` (HEAD `b1e523f`, 300 files).
Auditor: `sp6-auditor`, a fresh Opus agent that wrote none of SP6's code (card VSS-45). Read-only: no code changed.
Scope: the new modules 3mf 0.1.0, mesh 0.0.0 and profile-api 0.0.0; the changes in gcode-api, gcode-parser 0.13.0
(the `.gcode.3mf` subpath), gcode-planner 0.5.0, gcode-language 0.2.0, gcode-preview 0.4.1, webview-kit 0.6.0 and
test-webview 0.2.1.
Method: `/ponytail:ponytail-audit`, about 15 minutes. Probes ran in a scratch `git worktree` of HEAD under
`mktemp -d /private/tmp/claude-501/sp6audit.XXXX` (frozen-lockfile installs from the local registry; the worktree was
removed afterwards). The probes ran the modules' `src` in plain Node on hostile files I generated. `.reference/repos` was
only read.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. SP6 added readers for
the files a user opens: `3mf` (zip container, OPC parts, core/materials/production model, writer for edits), `mesh`
(binary/ASCII STL and OBJ into a welded mesh in a worker, with stats and a BVH, the search tree used for picking) and
`profile-api` (profile schema, inheritance, overrides, PrusaSlicer-style conditions with a linear-time regex engine,
and an 804-key setting catalogue generated from OrcaSlicer and Bambu Studio). gcode-parser gained `.gcode.3mf` plate
reading, and the SP5 fixes landed.

Load assumed: one person on a desktop opening files from the internet (Printables, MakerWorld, Thingiverse). So every
3MF, STL, OBJ and `.gcode.3mf` is untrusted input, up to the modules' own caps (1 GB mesh file, 512 MiB per zip entry).
None of the new readers has a VS Code consumer yet. They are libraries at the trust boundary, so their caps are the only
protection the viewer will have.

## Earlier audit (SP5-audit.md): the fixes hold

1. Bambu false warnings (GCP-98): Bambu Lab and Buddy `printer_model`s resolve to `bambu`/`prusa-buddy`
   (`gcode-language/src/domain/flavour.ts:L16`), both fall back to Marlin (`lookup.ts:L9-L10`), both are in the
   override enum (`package.json:L68-L74`). `test/corpus.test.ts` asserts zero unknown-command warnings on all 15 corpus
   files. Held.
2. Three flavour tables (GCP-99): `Flavour` and `flavourFromName` live in `gcode-api/src/domain/flavour.ts:L3,L21`.
   The parser (`slicer-tags.ts:L138`), planner (`limits.ts:L215`) and gcode-language (`lookup.ts:L38`) all use them.
   `grep` finds no other `type Flavour`. Held.
3. Flavour from the head only (GCP-100): `detectFlavour(head, tail)` (`status.ts:L18`). The corpus test asserts
   `orca--cube-marlin.gcode` (config block at the end) resolves to marlin. Held.
4. Restore error dropped (GCP-101): `onRestored: (err) => err ? showGlFailure(...) : ...`
   (`gcode-preview/src/presentation/webview/preview-renderer.ts:L133-L140`), test `renderer.test.ts:L129`. Held, with
   a type cast: finding 8.
5. Untested slider/toggle logic (GCP-102): pure `nextView` in `controls.ts:L40`, used by `main.ts:L141,L298`, tested
   in `test/controls.test.ts`. Held.
6. Rescan on every edit (GCP-103): `scansOnEdit` gate (`gcode-language/src/domain/size.ts:L13`, used at
   `features.ts:L119`). Held.
7. Catalogue lint (GCP-104): `FLAVOURS` checked (`catalogue.ts:L34,L63`), `CODE` rejects leading zeros (`L31`).
   Held. I did not re-check the cross-file duplicate check.
8. `NamedChunk` shortcut (GCP-105): gone; `grep NamedChunk` finds nothing. Held.
9. README/PROVENANCE (GCP-106): the README has a "Features" section, PROVENANCE a "Catalogue" section. Held.

Test runs (scratch worktree, frozen lockfiles): lint green in 3mf, mesh, profile-api and gcode-parser. Tests:
mesh 53, gcode-parser 367 and profile-api 265 pass. **3mf fails in a clean checkout** (finding 2), and profile-api
fails under load (finding 5).

## Must fix

1. **A 2 KB 3MF crashes the process through component fan-out** (`3mf/src/adapters/model/resolveProject.ts:L60-L107`)
   - **Module / layer:** 3mf, adapters (model resolution).
   - **What this is:** `flatten` walks each object's `<component>` list and copies every leaf mesh reference into the
     object's parts. It stops cycles and depth over 64, but it does not limit how many parts the walk produces.
   - **Problem:** an object with 10 components of an object with 10 components (and so on) grows by 10 times per level.
     That is the "billion laughs" attack in 3MF form. Seven levels give 1,000,000 parts; eight levels run out of
     memory. When per-triangle colours are present, each leaf also gets its own `Uint32Array` copy.
   - **How verified:** probe built the XML in memory and ran `readModel` + `resolveProject`. Levels 5/6/7 (1.5-2.1 KB)
     gave 10k/100k/1M parts in 17/102/665 ms and 16/74/512 MB of heap. Level 8 (2.4 KB) ended in
     `FATAL ERROR: JavaScript heap out of memory` (RSS 2.96 GB, heap limit 4 GB).
   - **Fix:** keep one counter across all `flatten` calls (leaf parts, or leaf triangles, which is better because it
     matches the mesh module's triangle cap). Throw `MalformedXmlError(part, 'components expand to more than N parts')`
     above a cap such as 100,000 parts or 10 M triangles. Add one test with the 8-level file.
   - **If we skip it:** any shared or downloaded 3MF can kill the extension host (or the viewer worker) the moment the
     viewer opens it.

2. **3mf's test suite fails in a clean checkout, so CI is red** (`3mf/test/production.test.ts:L86-L101`)
   - **Module / layer:** 3mf, tests.
   - **What this is:** the "real files" suite reads three 3MFs from `../../../../.reference/repos/...` and runs
     `test.each` only on the ones that exist.
   - **Problem:** `.reference/` is git-ignored, so on CI and in any fresh clone the list is empty. vitest then fails the
     file with "No test found in suite real files". The suite also reaches outside the module, which breaks the rule
     that `cd modules/3mf && pnpm test` works alone.
   - **How verified:** `pnpm test` in the scratch worktree (no `.reference`):
     `FAIL test/production.test.ts > real files: Error: No test found in suite real files`, with 140 passed and 2 skipped.
   - **Fix:** `describe.skipIf(present.length === 0)('real files', ...)` (filter once, outside). Better: copy the
     PrusaSlicer `production_ext.3mf` (AGPL-3.0, with a PROVENANCE line) into `test/fixtures` so the production path
     is always tested.
   - **If we skip it:** the 3mf job fails on every CI run and blocks `node scripts/run.mjs ci` for everything that
     depends on 3mf (gcode-parser, gcode-preview).

## Should fix

3. **Opening a 3MF inflates every part with no total limit: a 1.6 MB file takes 2.3 GB** (`3mf/src/adapters/zip/fflateZip.ts:L23,L118-L150`, `adapters/opc/opc.ts:L66-L78`)
   - **Module / layer:** 3mf, adapters (zip and OPC).
   - **What this is:** `readPackage` inflates every entry up front, and each entry is capped at 512 MiB. Before
     inflating, the reader also allocates the declared size (`new Uint8Array(e.size)`).
   - **Problem:** the limit is per entry only. A small zip of several highly compressible 400 MB entries holds all of
     them in memory. The code marks this as `shortcut: no total-inflated cap ... add with the streaming reader`, but
     the expected load (opening downloaded 3MFs) already crosses that limit, so it counts as a finding.
   - **How verified:** probe built a zip with fflate holding a valid root model plus 4 x 400 MB zero-filled
     `Metadata/pad*.bin`. The file was 1.64 MB. `openPackage` returned after 4.8 s with 2.31 GB of ArrayBuffers
     (RSS 2.57 GB). Forty such entries (a 16 MB file) would need 16 GB.
   - **Fix:** in `openZip`, add a `maxTotalBytes` option (default 1 GiB, say) and refuse at open when the declared
     sizes `entries.reduce((n, e) => n + e.size, 0)` exceed it. The streaming check already stops entries that inflate
     past their declared size, so the declared sum is a hard bound. This is one check plus one test, and it also
     covers the up-front allocation.
   - **If we skip it:** a crafted 3MF uses all the machine's memory and can crash VS Code, without breaking any
     per-entry rule.

4. **STL/OBJ triangle cap is checked only after the whole file is parsed and welded** (`mesh/src/application/parse-model.ts:L64-L80`, `adapters/obj/obj.ts:L16-L53`, `adapters/stl/ascii-stl.ts`)
   - **Module / layer:** mesh, application and adapters.
   - **What this is:** binary STL is checked against the 10 M hard cap from its header. OBJ and ASCII STL are checked
     after `parseObj`/`parseAsciiStl` return, and those already built the triangle soup and welded it.
   - **Problem:** one OBJ face line like `f 1 1 1 1 ...` fans into a triangle for every 2 bytes of text, and each
     triangle costs 36 bytes of soup. Memory grows about 18 times faster than the file, up to the 1 GB file cap.
     The parse runs in a worker thread, but ArrayBuffers are memory of the whole process.
   - **How verified:** probe with an 80 MB OBJ (one vertex, 100 face lines of 400k corners, under the 1 MiB line cap).
     `parseModel` threw `TooManyTrianglesError` (39,999,800 > 10,000,000) after 6.4 s, at a peak RSS of 2.49 GB. At
     the 1 GB file cap that is about 30 GB.
   - **Fix:** pass `hardTriangleCap` to the text parsers and throw `TooManyTrianglesError` as soon as
     `soup.length / 9` passes it (one comparison per face in `obj.ts`, one per facet in `ascii-stl.ts`). Add one test
     with a small cap.
   - **If we skip it:** a hostile or simply huge OBJ swaps the machine or crashes the extension host, when it should
     fail fast with the friendly "too many triangles" error.

5. **profile-api's regex timing tests fail when the machine is busy** (`profile-api/test/conditions-evaluate.test.ts:L110-L148`)
   - **Module / layer:** profile-api, tests.
   - **What this is:** three tests assert wall-clock times under 100 ms for the largest admitted NFA (a non-backtracking
     regex automaton) on a 512-character subject.
   - **Problem:** wall-clock time depends on the machine and its load, not on the code. On a busy CI runner the build
     fails at random.
   - **How verified:** with the mesh and gcode-parser tests running at the same time, `(?:.?){1666}` took 222.7 ms:
     `AssertionError: expected 222.659 to be less than 100`. The tests pass when they run alone.
   - **Fix:** assert the engine's linear bound instead of time: count the NFA steps (states x subject length) through
     a test hook, or raise the limit to about 2 s, which still catches a backtracking blow-up (those take seconds or
     more).
   - **If we skip it:** CI fails at random and people learn to re-run it, which hides real failures.

6. **profile-api ships AGPL-3.0-only data under an "AGPL-3.0-or-later" licence field, with no PROVENANCE** (`profile-api/package.json` `license`, `src/domain/catalogue/data/orca.json`, `bambu.json`)
   - **Module / layer:** profile-api, domain data and package metadata.
   - **What this is:** the catalogue (578 KB of labels, tooltips, defaults and enums) is generated from
     OrcaSlicer@09aa0114 and BambuStudio@79df7ae `PrintConfig.cpp`. The JSON `notice` field says correctly that the
     ported material "stays under AGPL-3.0" and that Orca is "v3.0 only". Orca's README says "version 3" and grants no
     "or later" option.
   - **Problem:** the package's SPDX `license` says `AGPL-3.0-or-later`, so npm, Open VSX and licence scanners report
     the wrong terms for the published package. The module also has no PROVENANCE.md, unlike gcode-language and mesh.
     The only attribution is inside the JSON and in `tools/catalogue/generate.ts`.
   - **How verified:** read `package.json`, `tools/catalogue/generate.ts:L16-L20,L478-L482`, the data's `notice` and
     `provenance` fields, and the OrcaSlicer README "License" section. Not checked by a lawyer: whether a v3-only part
     makes the combined package v3-only is my reading of AGPL §14.
   - **Fix:** set `"license": "AGPL-3.0-only AND AGPL-3.0-or-later"` (or plain `AGPL-3.0-only`). Add a short
     PROVENANCE.md naming both upstream commits, the files read, and that the catalogue data is AGPL-3.0. Add it to
     `files` so it ships. Decide once (decision D2's follow-up) whether gcode-language's Orca template quotes need the
     same field.
   - **If we skip it:** the published package misstates its licence. That is the kind of mistake D2 says to flag
     wherever it matters.

## Nice to have

7. **`.gcode.3mf` reads the whole `slice_info.config` before checking its 4 MiB limit** (`gcode-parser/src/adapters/gcode-3mf-plate.ts:L169-L180`)
   - **Module / layer:** gcode-parser, adapters.
   - **Problem:** `text('Metadata/slice_info.config')` inflates the entry (up to 512 MiB) and decodes it to a string,
     and only then compares `info.length` against the limit. A 500 KB entry that inflates to 512 MiB costs about 1.5 GB
     before the "statistics skipped" diagnostic.
   - **How verified:** read only.
   - **Fix:** check `zip.entries.find((e) => e.name === name)!.size > MAX_SLICE_INFO_BYTES` before inflating, or pass
     `{ maxEntryBytes: MAX_SLICE_INFO_BYTES }` to a second `inflated` call. One line.

8. **The preview builds a fake `GlContextError` to show the restore failure** (`gcode-preview/src/presentation/webview/preview-renderer.ts:L133-L140`, `webview-kit/src/gl/context.ts:L2`)
   - **Module / layer:** gcode-preview presentation, webview-kit gl.
   - **Problem:** `{ cause: 'restore', ... } as unknown as GlContextError` works today only because `showGlFailure`
     reads `cause` and `message`. If the kit's failure UI starts reading another field (or switches on `cause`), the
     preview breaks with no type error.
   - **How verified:** read; `GlFailureCause` has no `'restore'`.
   - **Fix:** add `'restore'` to `GlFailureCause` and its message in webview-kit (next minor), then drop the cast.

## Checked, no finding

- **Zip reader bounds** (`fflateZip.ts`): every central and local record read goes through `need()`. ZIP64 values
  above 2^53 are refused, encrypted entries refused, deflate fed in 64 KiB slices so overshoot stops within one slice,
  and short inflation is reported. The EOCD search is bounded to the last 64 KiB plus 22 bytes.
- **XML** (`xml.ts`, `modelScan.ts`, `readModel.ts`): saxes does not expand DTD entities or fetch external ones, so
  there is no entity-expansion or XXE (XML external entity) path. `readModel` streams in 1 MiB chunks, caps nesting at
  64, validates every number and index, and range-checks triangle indices against the vertex count.
- **`.gcode.3mf` tag scanner** (`gcode-3mf-plate.ts:L64-L100`): linear. Each `<` scans forward once, quotes jump with
  `indexOf`, and unterminated input ends the scan. `__proto__` keys only hit the ignored non-object setter. The
  readers sit behind the `./gcode-3mf` subpath (GCP-111), so the parser's main entry does not pull in 3mf.
- **Binary STL** (`binary-stl.ts`): binary is detected by exact length, the early cap comes from the header, and
  storage grows in fixed 2.4 MB blocks as bytes arrive, so a hostile count cannot force an allocation.
  `MAX_LINE_CHARS` (1 MiB) bounds text line joining.
- **Condition parser and regex** (`profile-api`): probes gave depth over 64 → `ConditionParseError`, source over
  64 KiB refused, `((a{50}){50}){50}` and `a{1000000000}` → `RegexRejected` (5,000-state cap), `(a*)*b`, `(|a)*$` and
  `((a?)*)*` finished in under 1 ms, and `(a|aa)*b` on 511 characters took 0.5 ms. `printer.__proto__` and
  `printer.constructor` resolve to "unknown" and are not read from the prototype. `compileRegex` overflows the stack
  on 5,000 nested parentheses, but `evaluate` caps patterns at 200 characters and `compileRegex` is not exported from
  the index.
- **Cura fixtures in mesh** (`test/fixtures/stl-obj/PROVENANCE.md`): two meshes from Cura@5bea2f8
  `resources/meshes`, LGPL-3.0 (the Cura repo `LICENSE`; I found no separate licence for meshes in the clone), copied
  unchanged and documented. They are test-only and not in `files`, so they are not published.
- **Layer lint**: `pnpm lint` (including the boundary rule) is green in 3mf, mesh, profile-api and gcode-parser.
  `node:crypto` and `node:worker_threads` appear only in adapters.

Verdict: fix 1 and 2 first (a 2 KB file crashes the reader; 3mf CI is red in a clean checkout), then 3 and 4 before
the viewer wires these readers to user files.

Lean: no lean findings beyond 8 (about -2 lines).

Not checked: the gcode-planner 0.5.0 `ToolheadWindow` transfer form (GCP-108) and the preview's use of it (GCP-109,
GCP-97 marker), the width/flow colour modes (GCP-96, PLT-192), the Playwright/SwiftShader setup (GCP-34), and the
test-webview change, beyond their tests' existence. I did not run lint or tests in gcode-api, gcode-planner,
gcode-language, gcode-preview, webview-kit and test-webview. Also not checked: 3mf `zipWriter`/`Package.save`
round-trip correctness (read only the parsing half), the mesh BVH and weld at 20 M triangles (VWR-389, VWR-37 spike),
profile-api `merge`/overrides/conversion semantics against PrusaSlicer and Orca, a verbatim-text check of the
catalogue against upstream, VS Code integration tests, and any real GPU run.

## Cards

| Finding | Severity | Board | Model | Card |
|---|---|---|---|---|
| 1 3MF component fan-out crashes the reader; cap leaf parts/triangles in `resolveProject` (3mf) | must fix (P0) | VWR | sonnet | VWR-390 |
| 2 3mf "real files" suite fails without `.reference`; skip when empty or vendor the fixture (3mf) | must fix (P0) | VWR | sonnet | VWR-391 |
| 3 No total inflated-size cap in `openZip`/`readPackage` (3mf) | should fix (P1) | VWR | sonnet | VWR-392 |
| 4 Triangle cap checked after OBJ/ASCII STL parse and weld (mesh) | should fix (P1) | VWR | sonnet | VWR-393 |
| 5 Wall-clock regex timing tests flake under load (profile-api) | should fix (P1) | PRF | sonnet | PRF-178 |
| 6 profile-api licence field and missing PROVENANCE for Orca/Bambu AGPL-3.0 data (profile-api) | should fix (P1) | PRF | opus | PRF-179 |
| 7 Check `slice_info.config` size before inflating (gcode-parser) | nice to have (P2) | GCP | sonnet | GCP-112 |
| 8 Add `'restore'` to webview-kit `GlFailureCause`, drop the preview's cast (webview-kit, gcode-preview) | nice to have (P2) | GCP | sonnet | GCP-113 |
