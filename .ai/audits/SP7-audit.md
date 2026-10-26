# SP7 audit

Date: 2026-10-26. Range: `git diff b9cf8526~1..HEAD -- vsslicer/` (18,270 files, nearly all of them the pinned
OrcaSlicer/Bambu Studio data in `profiles-data-orca/data`, about 117 files of code, tests and docs).
Auditor: `sp7-auditor`, a fresh Opus agent that wrote none of SP7's code (card VSS-46). Read-only: no code changed.
Scope: the SP6 bugfix cards in 3mf, mesh, gcode-parser, webview-kit and profile-api; gcode-preview (side panel, plate
picker, diagnostics, lazy text pane, Playwright snapshots); tooling (`third-party-notices`); `vsslicer/scripts`
(0.0.0 publish skip); profile-api (Prusa/SuperSlicer/Cura catalogue, groups, conversions, import-result types, ports,
`bundle_structure`, printer instances, PROVENANCE); the new modules profiles, profiles-prusa, profiles-orca,
profiles-cura, profiles-data-orca and project-extension.
Method: `/ponytail:ponytail-audit` under a 14-minute limit, so this was a reading audit: grep and read of the code that
takes untrusted input. No probes or test runs this time (see "Not checked"). `.reference/repos` was not touched.

What this repo does: VSSlicer is building a 3D-printing suite for VS Code as independent modules. SP7 closed the SP6
findings, gave the G-code preview a side panel with plates, diagnostics and a lazy text pane, and grew profile-api into
a cross-slicer setting catalogue with value conversions and a bundle-manifest parser. The profile modules other than
profile-api and profiles-data-orca are still empty 0.0.0 skeletons.

Load assumed: one person on a desktop opening downloaded files. Untrusted input is 3MF, STL/OBJ, `.gcode.3mf`, G-code,
profile bundles and configs.

## Earlier audit (SP6-audit.md): the fixes hold

1. 3MF component fan-out (VWR-390): one counter across the walk, `MAX_PARTS = 100_000` plus a triangle cap, throwing
   `components expand to more than ...` (`3mf/src/adapters/model/resolveProject.ts:L31,L71-L72`). Held.
2. 3mf suite red without `.reference` (VWR-391): `describe.skipIf(!existsSync(orcaBadge))('real files from .reference')`
   (`3mf/test/production.test.ts:L115`). Held. I did not re-run the suite in a clean checkout.
3. No total inflated cap (VWR-392): `DEFAULT_MAX_TOTAL_BYTES = 1 GiB`, checked on the declared sizes before inflating
   (`3mf/src/adapters/zip/fflateZip.ts:L10,L110-L111`). Held.
4. Triangle cap after parse (VWR-393): OBJ throws `TooManyTrianglesError` per face as the count passes the cap
   (`mesh/src/adapters/obj/obj.ts:L51`), ASCII STL during the parse (`adapters/stl/ascii-stl.ts:L35`). Held.
5. Wall-clock regex tests (PRF-178): the regex test now bounds the engine's step count
   (`profile-api/test/conditions-evaluate.test.ts:L90`, `steps <= 4 * states * (len + 1)`); no `performance.now`
   left in that file. Held.
6. Licence field and PROVENANCE (PRF-179): `profile-api/PROVENANCE.md` exists with commits, files and licences per data
   file. The `license` field is still `AGPL-3.0-or-later` while the package ships AGPL-3.0-only Orca/Bambu data and,
   new in SP7, LGPL-3.0-only Cura data (`PROVENANCE.md:L33`, "no 'or later' grant found"). That is Q20, deliberately
   open, so it is reported here and not re-decided; no new card (PRF-179 tracks it). `profiles-data-orca` correctly says
   `AGPL-3.0-only` and ships both upstream LICENCE files plus NOTICE.
7. `slice_info.config` size (GCP-112): the declared size decides before inflating; thumbnails are capped at 4 MiB each
   and 16 in all (`gcode-parser/src/adapters/gcode-3mf-plate.ts:L43-L48,L185-L222`). Held.
8. Fake `GlContextError` (GCP-113): `'restore'` is a `GlFailureCause` with its own message
   (`webview-kit/src/gl/context.ts:L2,L11`); the cast is gone from `preview-renderer.ts`. Held.

## Nice to have

1. **The bundle manifest is UTF-8 encoded on every parse, not only near the limit** (`profile-api/src/domain/bundle/bundle.ts:L106-L107`)
   - **Module / layer:** profile-api, domain (bundle).
   - **What this is:** `parseBundleStructure` refuses a `bundle_structure.json` over `BUNDLE_LIMITS.maxBytes`. The
     comment says the exact byte count "is checked only when near the limit".
   - **Problem:** the code is `text.length > max || new TextEncoder().encode(text).length > max`, so every manifest under
     the limit is encoded in full, which copies it once more. The bound is still correct; the comment and the code
     disagree, and the extra copy is wasted.
   - **How verified:** read the line; `||` evaluates the encode whenever the length check passes.
   - **Fix:** encode only when `text.length * 3 > max` (the UTF-16 length undercounts bytes by at most 3 times), as the
     comment says. One line, and a test that a manifest of 1/3 the limit in 3-byte characters still passes and one just
     over the limit in bytes still fails.
   - **If we skip it:** nothing breaks; a manifest is parsed with one extra copy, and the comment misleads the next reader.

## Checked, no finding

- **gcode-preview text pane:** the webview's request is validated (`validRequest`: safe non-negative integers), the host
  reads at most 64 KiB with `pread` (`adapters/file-read.ts`), and returns at most 400 lines of at most 4 KiB each
  (`domain/text-window.ts:L6-L10`). Only `file:` G-code gets a reader (`presentation/provider.ts:L54`). Bounded.
- **gcode-preview plate picker:** `loadPlate` checks the requested plate is one of the archive's plates before reading
  it (`application/load-3mf.ts`), and the plate's size problems join the diagnostics.
- **profile-api bundle parser:** size cap, JSON depth checked in a linear pass before `JSON.parse`, file-count cap
  across all lists and `printer_asset`, unsafe-path check (length, NUL, `..`, absolute), null-prototype maps so a
  `__proto__` key is plain data (`domain/bundle/bundle.ts:L57-L185`). Empty `printer_asset` objects do not add to the
  count, but they are bounded by the byte cap.
- **profile-api value conversions:** numbers allow only `0-9 . - + e E` before `Number()`, so `0x10`, `Infinity` and
  empty strings are refused; non-finite results are refused; scalar length and list length are capped
  (`domain/catalogue/mappings/values.ts:L31-L90`).
- **`vsslicer/scripts`:** 0.0.0 modules are skipped by publish, and `ci` fails when any module depends on a 0.0.0 one
  (`scripts/lib.mjs`, `run.mjs`), with tests in `scripts/test/lib.test.mjs`.
- **Build output in git:** `project-extension-0.0.0.vsix`, `dist/` and `test-results/` exist in the working tree but are
  not tracked (`git ls-files` finds none).
- **Empty profile modules:** profiles, profiles-prusa, profiles-orca and profiles-cura each export one constant. They are
  the planned homes of the next profile cards, are 0.0.0 (never published, nothing may depend on them), and carry no
  upstream data, so `AGPL-3.0-or-later` is right for them. Not a delete finding while their cards are planned.

## Not checked

- No probes and no test runs this sprint (time limit): the SP6 fixes were checked by reading, not by re-running the SP6
  hostile files. The 3mf clean-checkout run and the mesh OBJ fan-out probe are worth re-running in the SP8 audit.
- profile-api `tools/catalogue/*` (the C++ tokenizer `cpp.ts`, `prusa.ts`, `cura.ts`, `groups.ts`): build-time
  generators that read pinned upstream sources, not user input; not read.
- `convert-key.ts` and `rules.ts` mapping logic beyond the value parser; `printer-instance` validation; the ports and
  `contract.ts`.
- gcode-preview side panel rendering (`side-panel.ts`, `domain/panel.ts`) and the Playwright snapshot set; tooling
  `third-party-notices.mjs`; project-extension; `profiles-data-orca` scripts and the data tree hash.

## Cards

| Finding | Severity | Board | Model | Card |
|---|---|---|---|---|
| 1 Encode the bundle manifest only near the byte limit (profile-api) | nice to have (P2) | PRF | sonnet | PRF-180 |
