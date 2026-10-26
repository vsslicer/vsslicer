---
id: 46
title: Write the Marlin 2 and Prusa Buddy catalogue entries
type: docs
priority: P0
effort: L
model: sonnet
area: [language]
story: US16
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [45]
created: 2026-10-25
---

G and M codes with parameters, in our words.

## Acceptance criteria

- [x] Every G/M code in the Marlin 2 and Buddy references that the corpus uses is catalogued; lint passes
- [x] No upstream text is copied (spot-check note in Progress)

## Tasks

- [x] List codes used in the corpus first
- [x] Write entries
- [x] Lint

## Progress

Done (worker gcp46-worker). Criteria ticked below except where noted.

- Corpus scan (script in scratch, comments stripped, first token per line) over the non-Bambu text fixtures in `gcode-parser/test/fixtures`: orca/cube-marlin, cura, prusaslicer (*.gcode incl. twin), superslicer. 47 distinct codes: G0 G1 G2 G3 G4 G21 G28 G29 G80 G90 G92 M17 M73 M74 M82 M83 M84 M104 M106 M107 M109 M115 M140 M141 M142 M190 M201 M203 M204 M205 M221 M302 M403 M486 M555 M569 M572 M593 M702 M862.1 M862.3 M862.5 M862.6 M900 M907 T0 (counts: G1 165883, M204 8645, G3 6478, G2 4588, G0 1300, M73 1251, G92 661, M106 287, M201 66, M74 60, M107 39, M104 23, M486 19, M140 16, M83 15, G29 14, G90 13, M84 13, M109 11, M205 11, M900 9, M221/M204.. rest under 9). Binary .bgcode files not scanned (their .twin.gcode text twins are). Bambu/X1C files left to the Klipper/RRF/Bambu worker.
- `catalogue/marlin.json`: 32 entries, flavours ["marlin","prusa-buddy"] (Buddy is Marlin-based, so shared codes are written once). `catalogue/prusa-buddy.json`: 14 entries, flavours ["prusa-buddy"] (G1, M104 because reprap.json lists them for marlin/reprapfirmware/klipper only; plus Buddy-only G80 M74 M142 M403 M555 M572 M593 M702 M862.1/.3/.5/.6). All 47 corpus codes are covered across marlin.json, prusa-buddy.json and reprap.json (checked by script: missing = none). `catalogue/reprap.json` and the schema untouched.
- Sources: the validator allows only reprap.org/wiki/G-code, the Prusa-Firmware-Buddy repo and the Klipper reference, so `marlinfw.org/docs/gcode` would be REJECTED. Marlin entries cite reprap.org/wiki/G-code with a section anchor (anchors checked to exist in the fetched page). Buddy-only entries cite the repo root https://github.com/prusa3d/Prusa-Firmware-Buddy (no file path/line verified: the repo was not cloned). Decision for coordinator: allow marlinfw.org/docs/gcode in `SOURCES` if Marlin links are wanted.
- Unverified claims, flagged in the descriptions: M141/M142 Buddy meaning, M702 C, M862.1 A and F parameters. Parameters are from the corpus lines plus general knowledge, not read from upstream code.
- Spot-check (no upstream text copied): descriptions written from the corpus usage and own knowledge, then checked by script against the fetched reprap.org/wiki/G-code text: no 6-word run of any of the 162 description strings occurs in the page (0 hits). Manual comparison of G4, M221, M302, M486 and M900 against the page showed different wording.
- Duplicate rule: no conflict. Duplicates are checked per file per flavour; G1 and M104 appear in reprap.json (flavour marlin etc.) and in prusa-buddy.json (flavour prusa-buddy only), different flavours, and across files nothing is checked.
- BLOCKER for green tests: `test/catalogue.test.ts` line 18 hard-codes `assert.deepEqual(codes.sort(), ['G1','M104'])` for the whole catalogue dir, so it fails as soon as any other file exists (and will for the other worker's files too). I was told not to edit it; GCP-45 or the coordinator must change it (e.g. assert it loads and includes G1 and M104). Results: `pnpm lint` pass, `pnpm build` pass, `pnpm test` 11/12 pass, the 1 failure is that assertion.
- Files: vsslicer/modules/gcode-language/catalogue/marlin.json, catalogue/prusa-buddy.json (new). No CHANGELOG change needed beyond: "- Added: Marlin 2 and Prusa Buddy command catalogue (46 entries)."
- Unticked: none, but the module test run is red until the line-18 assertion is fixed.

- Review (gcp46-review): PASS, rescanned fixtures (46 non-Bambu codes) against all catalogue files: none missing; lint, build, test 14/14 pass; M204 Marlin (P/R/T/S) differs from klipper.json; M572 Buddy entry is prusa-buddy only (RRF stays in reprapfirmware.json); Buddy-only unclear params (M702 C, M862.1 A/F) marked unverified; facts for G4, M73, M106, M221, M302, M205, M486, M900 correct; descriptions plausible own wording (reprap.org not fetched, worker script check relied on).
