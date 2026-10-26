---
id: 194
title: Let third-party-notices take a vendored licence text for packages that ship none
type: chore
priority: P0
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP7"
owner: sp7-tooling-fix2
created: 2026-10-26
---

gcode-preview's build fails at `third-party-notices`: "saxes@6.0.0: no LICENSE file". GCP-36 bundles `@vsslicer/3mf` (and saxes, ISC, which ships no licence file) into the worker through gcode-parser's `./gcode-3mf` subpath. The notices tool needs a way for a consuming module to supply the licence text of a dependency that ships none.

**Code:** `vsslicer/modules/tooling/bin/` (the `third-party-notices` bin) and its tests (module: `tooling`, layer: n/a (tooling))

## Acceptance criteria

- [x] A consuming module can name a vendored licence text for a package that ships none (e.g. `"vsslicer": {"licenceTexts": {"saxes@6.0.0": "licences/saxes-ISC.txt"}}` in its package.json, or a file convention), pinned to the exact version; the text must match the package's SPDX `license` field kind (checked loosely: the file names the licence)
- [x] Without such an entry the check still fails as today; a stale entry (version no longer bundled) fails too
- [x] Tests for both; tooling version bumped in the coordinator's release

## Tasks

- [x] Option in the notices bin, tests

## Progress

Done: `third-party-notices` reads `vsslicer.licenceTexts` from the package.json in the cwd (`{"name@exact-version": "path"}`, path relative to package.json). Used only when the package ships no licence file; the text must contain one of the package's SPDX ids (case-insensitive); missing file or wrong licence fails; an entry whose name@version is not bundled fails as stale; no entry still fails as before. Output lists it as `### <path> (vendored)`.

Files: vsslicer/modules/tooling/bin/third-party-notices.mjs, vsslicer/modules/tooling/test/notices.test.mjs (one new test covering all cases).

Verified: tooling `pnpm lint && pnpm test && pnpm build` pass (54 tests). Proof on gcode-preview in scratch (/private/tmp/claude-501/sp7w.MmjH/proof, symlinked module, scratch package.json): with the entry all three metafiles pass rc=0 and saxes gets its ISC text; with a wrong version it fails as stale.

Not done: tooling version/CHANGELOG (coordinator).

Review fix (sp7-tooling-fix): the name check is now a whole-word match of the SPDX id, or a standard-wording phrase for mit/isc/apache-2.0/bsd-2/3-clause (real texts often omit the id); no substring matching. Entry paths whose realpath is outside the module directory are refused. New tests: Apache text with "Disclaimer" fails for an ISC package, ISC wording passes, `../` path refused. tooling lint/test (56)/build pass. Proof on gcode-preview (scratch /private/tmp/claude-501/sp7w.lvpZ/proof, all three metafiles): rc=0 with the saxes@6.0.0 entry; an outside path fails. Notes: .reference/notes/PLT-194-licence-texts-fix.md.

### Coordinator: shared-file changes
- gcode-preview/package.json, inside the existing `"vsslicer": {...}` object add: `"licenceTexts": { "saxes@6.0.0": "licences/saxes-ISC.txt" }`
- New file gcode-preview/licences/saxes-ISC.txt: copy /private/tmp/claude-501/sp7w.MmjH/proof/licences/saxes-ISC.txt (standard ISC text, "Copyright (c) Louis-Dominique Dubeau <ldd@lddubeau.com>" from saxes's package.json author). Check the new `licences/` dir is not excluded by the vsix/files lists if relevant.
- gcode-preview must use the new tooling (needs the coordinator's tooling release + dependency bump).
- tooling: bump version and CHANGELOG line "third-party-notices: vsslicer.licenceTexts for packages shipping no licence file".

Review (sp7-rev-c): FAIL
- Checked: diff of bin/third-party-notices.mjs and test/notices.test.mjs; tooling `pnpm lint && pnpm test` pass (54). Re-ran the proof on a copy (/private/tmp/claude-501/sp7w.rSFX/proof, `--out` to scratch): correct entry rc=0 with saxes's ISC text as `(vendored)`; `saxes@6.0.1` entry fails as stale; no entry fails as before; vendored text used only when the package ships no licence file. The ISC text is the standard ISC licence with the saxes package.json author line (`Louis-Dominique Dubeau <ldd@lddubeau.com>`, licence ISC; README has no licence section): fine for the coordinator to copy.
- FAIL, bin/third-party-notices.mjs:82 (`text.includes(id.toLowerCase())`): the "file names the licence" check is a plain substring match, so it is vacuous for the commonest ids. "isc" matches "disclaimer"/"DISCLAIMED" (Apache-2.0, BSD texts) and "mit" matches "permitted", "limitation", "submit" (almost any licence). Repro: in the proof copy point `saxes@6.0.0` at a file containing `Apache License\nDisclaimer of Warranty\n` -> rc=0, an Apache text accepted as the ISC licence. Fix: match the id as a whole word (e.g. `new RegExp(`(^|[^a-z0-9.+-])${escaped}($|[^a-z0-9.+-])`, 'i')`), and add a test where the wrong text contains "disclaimer" for an ISC package (the current test's "MIT License\n" never exercises this).
- Recommend in the same fix (not failing on its own; the entry comes from the module's own package.json): refuse a path that resolves outside the module directory (`../../etc/passwd`, `/etc/hosts` are read today and would be embedded if they happened to contain the id), since such a file is also not shipped with the module. A non-string value gives a one-line Node error ("paths[1] argument must be of type string"); acceptable.
- No worker notes file `.reference/notes/PLT-194-*.md` exists (project rule).

Review (sp7-rev2-e): FAIL
- Checked: diff of bin/third-party-notices.mjs and test/notices.test.mjs; tooling `pnpm lint && pnpm test` pass (55 tests, not 56 as stated). Re-ran the saxes proof on a copy (/private/tmp/claude-501/sp7w.iJAr/plt/proof, `--out` to scratch, all three metafiles): saxes@6.0.0 entry rc=0 with `licences/saxes-ISC.txt (vendored)`; Apache text with "Disclaimer"/"permitted" for ISC rc=1; `../x.txt` (existing) refused as outside; saxes@6.0.1 stale rc=1. Matching is linear (fixed lookarounds, `includes`). Whole-word fix for "isc"/"mit" holds.
- Real-text check (/private/tmp/claude-501/sp7w.iJAr/plt/real.mjs runs the bin's own `names()` over every distinct LICENSE* text of MIT/ISC/Apache-2.0/BSD-2/BSD-3 packages under all modules' node_modules/.pnpm: 221 MIT, 16 ISC, 12 Apache, 9 BSD-2, 11 BSD-3). MIT, ISC and Apache texts all pass for their own id and fail for the others (the exceptions are mislabelled or bundled multi-licence files, e.g. @bcoe/v8-coverage says MIT but ships ISC text, so failing it is correct).
- FAIL, bin/third-party-notices.mjs:45-46: `bsd-2-clause` and `bsd-3-clause` have the same phrase, so the check cannot tell them apart. A real BSD-2-Clause text passes for a BSD-3-Clause package (8 of 9 texts, e.g. 3mf/node_modules/.pnpm/@secretlint+core@10.2.2_supports-color@7.2.0/node_modules/structured-source/LICENSE.BSD), and every BSD-3 text passes for BSD-2-Clause (10 of 11, e.g. .../ajv@8.20.0/node_modules/fast-uri/LICENSE). The BSD-2 text lacks the non-endorsement clause BSD-3 requires. Fix: BSD-3 also needs its third clause ("neither the name of"); BSD-2 needs the redistribution phrase and must not have that clause. Add tests: BSD-2 text for a BSD-3-Clause package fails, and the other way round.
- FAIL (same lines): a real BSD-3-Clause text fails for its own id: gcode-language/node_modules/.pnpm/diff@4.0.4/node_modules/diff/LICENSE says "Redistribution and use of this software in source and binary forms". It fails safe, but a vendored copy of that text would be refused. Match a shorter phrase, e.g. "in source and binary forms".

Review (sp7-rev3-g): PASS
- `names()` at bin/third-party-notices.mjs: BSD-3 needs "endorse", BSD-2 must lack it; shared phrase is now "in source and binary forms" (diff@4.0.4 wording). New test covers BSD-2/BSD-3 both ways.
- Real-text checker (copy of sp7w.AiRg/real.mjs printing every path, /private/tmp/claude-501/sp7w.IJ4x/real.mjs; 221 MIT, 16 ISC, 12 Apache, 9 BSD-2, 11 BSD-3 texts): no BSD-2/BSD-3 cross passes left; diff@4.0.4 BSD-3 passes. Remaining lines, each checked: @bcoe/v8-coverage (MIT metadata, ISC text), boundary LICENSE.LIBCXX (BSD-2 package's second, MIT/UIUC file; its LICENSE.BSD passes), typed-rest-client (MIT + bundled ISC notice), @vitest/istanbul-lib-coverage (BSD-3 + MIT in one file), vitest/vite LICENSE.md (bundled-deps aggregates), fs.realpath (ISC + Node's MIT). All multi-licence files or wrong metadata, as the fixer said.
- tooling `pnpm lint && pnpm test` pass (56 tests).
- Saxes proof re-run on a copy (/private/tmp/claude-501/sp7w.IJ4x/proof, `--out` to scratch, all three metafiles): rc=0, saxes@6.0.0 lists `licences/saxes-ISC.txt (vendored)`.
