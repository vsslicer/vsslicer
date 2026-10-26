---
id: 197
title: Allow AGPL-3.0-only for data packages that ship PROVENANCE.md in the licence check
type: feature
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
created: 2026-10-26
---

Q20 and Q21 make two packages AGPL-3.0-only on purpose (`profile-catalogue-data`, PRF-192; and profiles-data-orca's upstream data), but `tooling/bin/check-licence.mjs:44-45` demands `AGPL-3.0-or-later` from every module.

**Code:** `vsslicer/modules/tooling/bin/check-licence.mjs` and its test (module: `tooling`)

## Acceptance criteria

- [x] A module may declare `"license": "AGPL-3.0-only"` only when its `files` lists `PROVENANCE.md` and the file exists; every other module still must be `AGPL-3.0-or-later`; the error names the rule
- [x] Tests: or-later passes; only with PROVENANCE passes; only without PROVENANCE in `files` fails; only with `files` listing a missing file fails; any other SPDX id fails
- [x] **Bounds:** package.json read is capped (1 MiB) as the script does today, or the cap is added

## Progress

Changed `vsslicer/modules/tooling/bin/check-licence.mjs` and `test/licence.test.mjs`.
- `AGPL-3.0-only` is accepted only when `files` lists `PROVENANCE.md` and the file exists; otherwise the `package-license` error names the rule. Other ids fail. package.json read capped at 1 MiB.
- SPDX header rule: the source header must be the package's own id (`SPDX-License-Identifier: AGPL-3.0-only` for an only module, or-later otherwise); tested.
- Tests: 7 new in licence.test.mjs (all pass); tooling `pnpm lint` passes.
- profile-catalogue-data FAILS the new check (not edited): 13 source files carry or-later headers and need `AGPL-3.0-only`: eslint.config.mjs, src/index.ts, src/load.ts, test/load.test.ts, test/provenance.test.ts, tools/catalogue/{cpp,cura,entry,generate,groups,keys,prusa}.ts, vitest.config.ts.
- Not done: the headers in that module (coordinator/its owner).

**Review failed (sp9-rev-plt-197)**
- Ran: tooling `pnpm test` (68 pass, 0 fail), `pnpm lint` (pass), `pnpm build` (pass); `node scripts/run.mjs checks` (exit 0, check-licence clean for every module). New vs HEAD check-licence over `modules/*`: HEAD failed only profile-catalogue-data (14 problems), the new one fails nothing, so no regressions.
- Mutation probes in a mktemp copy (drop the existsSync check, drop the `files` check, drop the 1 MiB cap, force the or-later header, accept any id): each one fails at least one of the new tests. All three criteria are met in check-licence.mjs.
- Header decision: requiring the SPDX header to match the package licence is right. An or-later header inside an AGPL-3.0-only package contradicts the package, and file headers are what reach downstream copies. But it is only half done. The tooling ESLint rule hardcodes or-later, so no AGPL-3.0-only module can pass `pnpm lint`: profile-catalogue-data (headers now -only) gets 13 `spdx/header` errors from eslint, and with or-later headers it would fail check-licence instead.
- Problem: `vsslicer/modules/tooling/eslint.mjs:9,23` (`const header = '// SPDX-License-Identifier: AGPL-3.0-or-later'`, compared with `lines[0]?.trimEnd() !== header`). Fix I expect: have the `spdx/header` rule accept the module's own id (read `license` from the package.json nearest the linted file, or just accept either `AGPL-3.0-or-later` or `AGPL-3.0-only` and leave the match to check-licence). Add a tooling test where an -only header passes the ESLint rule. Then publish tooling and bump profile-catalogue-data's tooling dev dependency so its `pnpm lint` passes.
- Minor note, not part of the FAIL: `includes(spdx)` became `trim().endsWith(spdx)`, which is stricter (trailing text after the id now fails). No module is affected and no test covers it.

**Fix for the review FAIL (sp9-plt-197-fix)**
- `vsslicer/modules/tooling/eslint.mjs`: the `spdx/header` rule now expects `// SPDX-License-Identifier: <id>` where id is the `license` of the nearest package.json (`AGPL-3.0-only` or `AGPL-3.0-or-later`; anything else or none defaults to or-later). Read once per directory (cached), capped at 1 MiB, malformed JSON falls back to or-later.
- Tests (test/lint.test.mjs, fixtures `test/fixtures/lint/licence-only`, `licence-or-later`): an -only header passes in an -only package and fails `spdx/header` in an or-later package. Tooling `pnpm test` 70 pass, 0 fail; `pnpm lint` passes.
- Verified profile-catalogue-data (not edited) with a mktemp config importing the local tooling eslint.mjs by absolute path: 0 `spdx/header` errors. The same external-config run reports 6 `import-x/no-extraneous-dependencies` errors, but they are an artifact of the external config: the module's own installed tooling 0.8.3 gives the same 6 under that setup, and its normal lint shows none of them.
- Not done: publishing tooling and bumping profile-catalogue-data's tooling dev dependency (coordinator). The minor `endsWith` stricter note is unchanged.

**Review failed (sp9-rerev-plt-197)**
- Ran: tooling `pnpm test` (70 pass, 0 fail), `pnpm lint` (pass), `pnpm build` (pass); `node scripts/run.mjs checks` (exit 0).
- Previous FAIL is fixed in behaviour: `eslint.mjs` `spdx/header` now expects the nearest package.json's id. Linted every module (38) against the local `eslint.mjs` through a mktemp ESLint API probe (spdx/header only): profile-catalogue-data 0 errors (HEAD eslint.mjs: 13); printer-api, gcode-parser, slicer-runtime, profile-api, profiles-data-orca and every other or-later module 0 errors. The only hits (8, in `dist-test/` of six extension modules) are identical under HEAD's eslint.mjs and come from the probe bypassing those modules' own `dist-test` ignore, so no regressions.
- Mutations in a mktemp copy: hardcode or-later -> 1 test fails; always -only -> 14 fail; accept either id -> 1 fails. Good.
- Problem: the walk-up to a parent package.json is untested. Mutation `vsslicer/modules/tooling/eslint.mjs:31` (drop `else if (dirname(dir) !== dir) id = licenceFor(dirname(dir));`) passes all 18 lint tests, yet with it profile-catalogue-data gets 11 `spdx/header` errors (every file under `src/`, `test/`, `tools/`). Both fixtures put `y.ts` next to its package.json, so the path every real -only module uses is never exercised. Fix I expect: move `test/fixtures/lint/licence-only/y.ts` to `test/fixtures/lint/licence-only/src/y.ts` (and the same for `licence-or-later`), updating `test/lint.test.mjs:45,47`; no code change.
- check-licence.mjs criteria unchanged since the first review and still met. Minor `endsWith` note still stands, not part of this FAIL.

**Fix for the second review FAIL (sp9-plt-197-fix2)**
- Moved `test/fixtures/lint/licence-only/y.ts` and `licence-or-later/y.ts` to `<fixture>/src/y.ts` and updated the two paths in `test/lint.test.mjs`. No code change.
- Verified: in a mktemp copy, replacing the walk-up line (`eslint.mjs:31`) with `}` makes lint tests go 17 pass / 1 fail. Real tree: tooling `pnpm test` 70 pass, 0 fail; `pnpm lint` passes.

**Review passed (sp9-rerev2-plt-197)**
- Fixtures now put `y.ts` under `<fixture>/src/`, so the walk-up is exercised. Mutation in a mktemp copy: replacing `eslint.mjs:31` (walk-up) with `}` -> lint tests 17 pass / 1 fail.
- Ran: tooling `pnpm test` (70 pass, 0 fail), `pnpm lint` (pass), `pnpm build` (pass); `node scripts/run.mjs checks` (exit 0).
- Rest of the card unchanged since the two earlier reviews and still holds. Still open, outside this card's code: publish tooling and bump profile-catalogue-data's tooling dev dependency (coordinator). Minor `endsWith` note stands.
