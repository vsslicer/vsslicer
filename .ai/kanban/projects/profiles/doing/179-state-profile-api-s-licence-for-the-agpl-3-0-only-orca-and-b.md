---
id: 179
title: "State profile-api's licence for the AGPL-3.0-only Orca and Bambu data and add PROVENANCE"
type: bug
priority: P1
effort: S
model: opus
sprint: "VSS:SP10"
owner: sp7-prf-lic
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: profile-api (package, data). Finding 6 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] Fixed as the audit describes
- [x] A test that fails before the fix

## Tasks

- [ ] Fix as the audit describes

## Progress

Blocked on owner question Q20 (licence choice). Everything else is ready (sp7-prf-lic).

Done:
- `vsslicer/modules/profile-api/PROVENANCE.md`: both upstream commits in full (OrcaSlicer `09aa0114b4e145b89cd61015d8cdf29dbc15b008`, BambuStudio `79df7ae309be398ed30c9f397c13c9911c2edc57`, matching the data's `provenance` fields and `ORCA_COMMIT`/`BAMBU_COMMIT` in `tools/catalogue/generate.ts`), the files read, the licence lines quoted with path (`OrcaSlicer@09aa0114:README.md:260`, `BambuStudio@79df7ae:README.md:43`: "version 3", no "or later"), the data is AGPL-3.0-only, the module's own code is the project licence. An "Other slicers" section with an empty table for the Prusa/SuperSlicer and Cura cards to append to.
- `vsslicer/modules/profile-api/test/provenance.test.ts`: fails if PROVENANCE.md is missing or does not name the full commit for each generator constant (so a regeneration from a new commit must update it). Verified failing before: with PROVENANCE.md moved away, vitest fails with ENOENT; with it, passes.
- Notes: `.reference/notes/PRF-179-profile-api-licence.md`.

Verified: `pnpm exec prettier --check PROVENANCE.md test/provenance.test.ts` clean; `vitest run` in the module: 14 files, 279 tests pass (an earlier run had 24 failures in another file while another agent was mid-edit; the rerun was clean); `pnpm build` passes. `pnpm lint` fails on 2 errors in `src/domain/conditions/evaluate/regex.ts:193,204`, a file this card did not touch (another SP7 card).

gcode-language (audit D2 follow-up), recorded, not changed: same problem, smaller. Its `package.json` says `"license": "AGPL-3.0-or-later"`, and `catalogue/bambu.json` has 36 descriptions quoting comments from OrcaSlicer@09aa0114 BBL machine templates (`resources/profiles/BBL/machine/*.json`, AGPL-3.0 only). Its PROVENANCE.md calls them "compatible with this module's AGPL-3.0-or-later", which is wrong for v3-only material. The quotes are a few words each (e.g. "enable remap"); whether they are copyrightable at all is not checked. Its PROVENANCE.md is also not in `files`. Whatever Q20 decides should be applied there too (or the quotes paraphrased instead of quoted, which keeps it -or-later).

Not done: the `license` field and `files` (wait on Q20); the README line (shared file).

### Coordinator: shared-file changes

`vsslicer/modules/profile-api/package.json`, by Q20 answer:

- "AGPL-3.0-only for profile-api": `"license": "AGPL-3.0-or-later",` becomes `"license": "AGPL-3.0-only",` and `"files"` becomes `["dist", "LICENSE", "README.md", "PROVENANCE.md"]`.
  (The audit's alternative `"AGPL-3.0-only AND AGPL-3.0-or-later"` is valid SPDX too, but resolves to the same terms for users; plain `AGPL-3.0-only` is simpler.)
- "Separate data package": not a one-line change. New module (e.g. `profile-catalogue-data`) with `"license": "AGPL-3.0-only"`, `files` incl. `PROVENANCE.md`, holding `src/domain/catalogue/data/*.json` and `tools/catalogue/`; profile-api keeps `"license": "AGPL-3.0-or-later"`, drops the data and gets the catalogue through a semver dependency; this PROVENANCE.md moves with the data. Needs its own card.
- Either way, `CHANGELOG.md` line under the next version: `- Licence: the Orca and Bambu catalogue data is AGPL-3.0-only; PROVENANCE.md names the upstream commits and ships with the package (PRF-179).`
- README line (until Q20, as Q20's text says): `Licence: the module's code is AGPL-3.0-or-later; the generated catalogue data (src/domain/catalogue/data/) is ported from OrcaSlicer and Bambu Studio and is AGPL-3.0-only. See PROVENANCE.md.`
- gcode-language, if Q20 picks "only": `vsslicer/modules/gcode-language/package.json` `"license": "AGPL-3.0-only",`, add `"PROVENANCE.md"` to `files`, and fix "compatible with this module's AGPL-3.0-or-later" in its PROVENANCE.md.

Review (sp7-rev-prf), prepared files only, card stays in doing for Q20: PROVENANCE.md and test/provenance.test.ts are accurate. Verified: `.reference/repos/OrcaSlicer` HEAD is 09aa0114b4e145b89cd61015d8cdf29dbc15b008 and BambuStudio is 79df7ae309be398ed30c9f397c13c9911c2edc57, matching ORCA_COMMIT/BAMBU_COMMIT (`tools/catalogue/generate.ts:10,475`). Quotes are exact: OrcaSlicer README.md:260 "- **OrcaSlicer** is licensed under the GNU Affero General Public License, version 3." and BambuStudio README.md:43, both sentences verbatim. Neither README has "or later" or "later version". LICENSE.txt (Orca) and LICENSE (Bambu) are AGPL v3 texts. The files read match generate.ts:11-13. The entry counts 804/96 match the data, and 512 orca.json entries carry `native.bambu`. The test imports generate.ts without running it (main guarded at :561) and fails if the full hash is missing. Minor: the `AGPL-3.0-only` assertion is repeated in both test.each rows. No changes made.

**Coordinator (SP10): Q20 answered "Separate data package" (resolved 10:43).** Remaining scope of this card: (1) profile-api README states that the Orca/Bambu catalogue data is AGPL-3.0-only and is moving to `profile-catalogue-data` (PRF-192, PRF-193 switch profile-api over); profile-api's `license` stays `AGPL-3.0-or-later`; its PROVENANCE.md and `test/provenance.test.ts` stay until PRF-193 removes the data with them. (2) gcode-language: keep `AGPL-3.0-or-later` by paraphrasing the 36 descriptions in `catalogue/bambu.json` that quote OrcaSlicer BBL machine templates (in our own words, not upstream text), correct its PROVENANCE.md (no "compatible with -or-later" claim for v3-only text; say the descriptions are our own), and add PROVENANCE.md to its `files`. CHANGELOG lines in both modules under `## Unreleased`.
