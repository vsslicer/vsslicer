---
id: 98
title: Stop false unknown-command warnings on Bambu files and make the bambu and prusa-buddy catalogues selectable
type: bug
priority: P0
effort: M
model: opus
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-language (domain, catalogue). Finding 1 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] A Bambu Lab file (orca/cube-x1c) shows no warning for standard codes (M400, G17, M220); the bambu and prusa-buddy catalogues are reachable by detection and by the override setting
- [x] A test that fails before the fix

## Tasks

- [x] Fix as the audit describes

## Progress

Done (gcp98-worker). Notes: `.reference/notes/GCP-98-bambu-warnings.md`.

- (a) Detection (`src/domain/flavour.ts`): a Marlin or unstated flavour plus `; printer_model = Bambu Lab ...` gives
  `bambu`; plus a Buddy model (MINI, MK3.5, MK3.9, MK4, XL, COREONE prefixes) gives `prusa-buddy`. Verified on the corpus:
  Bambu Studio and Orca BBL files both write `gcode_flavor = marlin` and `printer_model = Bambu Lab X1 Carbon` in the head
  (13-23 KB in); `; BambuStudio` alone was not used because Bambu Studio writes it for third-party printers too. A klipper
  (or other) stated flavour is never overridden. Fallback (`src/domain/lookup.ts` `buildIndex`): `bambu` and `prusa-buddy`
  get every marlin entry their own catalogue lacks. Override enum in package.json gains `prusa-buddy` and `bambu`.
- (b) marlin.json: G17, M105, M114, M117, M220, M400, T1 (marlinfw.org pages, each checked 200). bambu.json: M620.1, M621,
  M622, M624, M625, M970, M971, M974, M976, M981, M1003, T255, sourced to OrcaSlicer@09aa0114 templates/source, marked
  UNDOCUMENTED and UNVERIFIED like the existing entries.
- (c) `test/corpus.test.ts`: zero unknown-command warnings on all 15 corpus files with their detected flavour, plus the
  detection of Bambu/Buddy files. Fixtures: the module already copies corpus excerpts into `test/fixtures`, so
  `test/fixtures/corpus/<folder>--<file>.gcode` are excerpts (head flavour/model lines + first line of each distinct
  code, 60 KB total; rule in PROVENANCE.md), in a subfolder so the grammar snapshot glob skips them. Confirmed the test
  fails on HEAD's flavour.ts/lookup.ts/catalogue (bambu-studio cube resolves to marlin). Before: cube-x1c 927 warnings.
- Behaviour change: PrusaSlicer MINI/MK4 files with the flavour only at the end now resolve to `prusa-buddy` (were unknown,
  no warnings); corpus shows zero warnings for them. The existing flavour.test expectation for `prusaslicer.gcode` changed.
- Verified: `pnpm install && pnpm lint && pnpm build && pnpm test` green (28 tests + grammar snapshots).
- Where it meets other cards: GCP-99 (shared flavour-name mapping) untouched; `resolveFlavour` still maps only marlin*.
  GCP-100 (end-of-file detection): with whole-file detection, `prusaslicer/test_vase` (MK3MMU2, marlin) would warn on
  Prusa-Firmware codes M862.1 M862.3 G80 M403 M702 and `superslicer` (klipper) on G21; the corpus test will catch it then.
  Orca's generic `cube-marlin` resolves to nothing today (flavour at the end).
- Not done: T2-T7 and other multi-tool codes the corpus does not use.

Files: `src/domain/flavour.ts`, `src/domain/lookup.ts`, `catalogue/marlin.json`, `catalogue/bambu.json`, `package.json`
(enum), `PROVENANCE.md`, `test/corpus.test.ts`, `test/flavour.test.ts`, `test/features.test.ts`, `test/fixtures/corpus/*`
(15 new).

Changelog: Fixed: Bambu Lab files (Bambu Studio, Orca) use the Bambu catalogue, and Prusa Buddy printers the Buddy one, both falling back to Marlin, so standard and Bambu codes no longer warn as unknown; added G17, M105, M114, M117, M220, M400, T1 and 12 Bambu codes; `bambu` and `prusa-buddy` can be chosen in `flavourOverrides`.

- Review passed (gcp98-reviewer): lint, build, test green (28 pass + grammar snaps). Full gcode-parser corpus (not just excerpts): 15 files, 0 unknown-command warnings; bambu-studio and orca x1c files detect `bambu`, MINI files `prusa-buddy`; orca cube-marlin, test_vase, arcs, superslicer, cura stay undefined (flavour at file end, GCP-100; zero warnings there is vacuous). Corpus test fails without the fix (src flavour/lookup and both catalogues reverted in scratch copy: 2 of 2 fail, bambu-studio--cube resolves marlin). Buddy list checked against Prusa-Firmware-Buddy@1ce23f33 README (MINI, MK3.5, MK3.9, MK4, XL, CORE One) and PrusaSlicer-2.9 PrusaResearch.ini printer_model values: prefixes match Buddy variants (MK4S, MK4IS, XLIS, COREONEL, MK3.5MMU3) and exclude MK3S, MK3MMU2, MK3SMMU3, MK2.5. Orca line cites (GCode.cpp 6505/6508/4607, GCodeWriter 761, GCodeProcessor 7105/6927) and X1 template contents (M620.1, M622, M976 S3 P2, M621 S255, T255, M971 S11 C10 O0) confirmed at 09aa0114; marlin.json source URLs follow marlinfw.org pattern the worker curl-checked. Note: unknown flavour still never warns, so detection-less files are untested until GCP-100.
